
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'
import http from 'http'
import { Server } from 'socket.io'
import { supabase } from './db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' }})

// --- In-memory matchmaking queues
const queues = { any: [], male: [], female: [] }
const partners = new Map() // socketId -> partnerId

// --- In-memory user database (replace with real DB)
const users = new Map() // userId -> { isPro: boolean, lastFreeGift: string, partnerId?: string }

io.on('connection', (socket)=>{
  socket.on('find_partner', ({ gender = 'any', userId } = {})=>{
    const g = ['male','female'].includes(gender) ? gender : 'any'
    const pool = queues[g]
    let partnerId = null
    while(pool.length){
      const candidate = pool.shift()
      if (candidate && io.sockets.sockets.get(candidate)) { partnerId = candidate; break }
    }
    if (!partnerId){
      pool.push(socket.id)
      return
    }
    partners.set(socket.id, partnerId)
    partners.set(partnerId, socket.id)
    
    // Store user connection for gift functionality
    if (userId) {
      if (!users.has(userId)) {
        users.set(userId, { isPro: false, lastFreeGift: null })
      }
      users.get(userId).socketId = socket.id
    }
    
    io.to(socket.id).emit('match_found', { id: partnerId, gender: g })
    io.to(partnerId).emit('match_found', { id: socket.id, gender: g })
  })

  socket.on('message', ({ id, text })=>{
    const partner = partners.get(socket.id)
    if(partner) io.to(partner).emit('message', { id, text })
  })

  socket.on('leave', ()=>{
    const partner = partners.get(socket.id)
    partners.delete(socket.id)
    if (partner){
      partners.delete(partner)
      io.to(partner).emit('partner_left')
    }
  })

  socket.on('yt', (evt)=>{
    const partner = partners.get(socket.id)
    if (partner) io.to(partner).emit('yt', evt)
  })

  socket.on('disconnect', ()=>{
    for (const q of Object.values(queues)){
      const idx = q.indexOf(socket.id)
      if (idx >= 0) q.splice(idx,1)
    }
    const partner = partners.get(socket.id)
    partners.delete(socket.id)
    if (partner){
      partners.delete(partner)
      io.to(partner).emit('partner_left')
    }
  })
})

// --- Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_XXX')

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body
    let customerEmail = null
    
    // Get user email from Supabase if userId provided
    if (userId) {
      const { data: user } = await supabase.auth.admin.getUserById(userId)
      customerEmail = user?.user?.email
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID || 'price_xxx', quantity: 1 }],
      customer_email: customerEmail,
      success_url: (process.env.SUCCESS_URL || 'http://localhost:5173/success') + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL || 'http://localhost:5173/cancel',
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: {
        userId: userId || 'anonymous'
      }
    })
    res.json({ url: session.url })
  } catch (e){
    res.status(500).json({ error: e.message })
  }
})

const giftPrices = {
  flower: process.env.PRICE_FLOWER || null,
  cat: process.env.PRICE_CAT || null,
  cake: process.env.PRICE_CAKE || null,
  peach: process.env.PRICE_PEACH || null,
  heart: process.env.PRICE_HEART || null,
}

app.post('/gift/buy', async (req,res)=>{
  const { giftType, userId } = req.body
  const priceId = giftPrices[giftType]
  if (!giftType) return res.status(400).json({ error: 'Missing gift type' })
  
  // Check if user exists and get their data
  if (userId && users.has(userId)) {
    const user = users.get(userId)
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)
    
    // Check if user is Pro and eligible for free gift
    if (user.isPro && (!user.lastFreeGift || new Date(user.lastFreeGift) < weekAgo)) {
      // Give 1 free gift
      user.lastFreeGift = now.toISOString()
      users.set(userId, user)
      
      // Send gift to partner if they exist
      const senderSocketId = user.socketId
      const partnerSocketId = partners.get(senderSocketId)
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('gift_received', { gift: giftType, from: userId })
      }
      
      return res.json({ message: 'Free gift sent!', isFreeGift: true })
    }
  }
  
  // Otherwise use Stripe checkout for paid gift
  if (!priceId) return res.status(400).json({ error: 'Gift not configured on server' })
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: (process.env.SUCCESS_URL || 'http://localhost:5173/success'),
      cancel_url: process.env.CANCEL_URL || 'http://localhost:5173/cancel',
      automatic_tax: { enabled: true },
      metadata: {
        giftType,
        userId: userId || 'anonymous'
      }
    })
    res.json({ url: session.url })
  } catch(e){
    res.status(500).json({ error: e.message })
  }
})

// Set user Pro status
app.post('/user/set-pro', async (req, res) => {
  const { userId, isPro } = req.body
  if (!userId) return res.status(400).json({ error: 'Missing userId' })
  
  if (!users.has(userId)) {
    users.set(userId, { isPro: false, lastFreeGift: null })
  }
  
  const user = users.get(userId)
  user.isPro = isPro
  users.set(userId, user)
  
  res.json({ message: 'Pro status updated', isPro })
})

// Check free gift availability
app.get('/user/:userId/free-gift-status', async (req, res) => {
  const { userId } = req.params
  
  if (!users.has(userId)) {
    return res.json({ isPro: false, freeGiftAvailable: false })
  }
  
  const user = users.get(userId)
  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(now.getDate() - 7)
  
  const freeGiftAvailable = user.isPro && (!user.lastFreeGift || new Date(user.lastFreeGift) < weekAgo)
  
  res.json({ 
    isPro: user.isPro, 
    freeGiftAvailable,
    lastFreeGift: user.lastFreeGift 
  })
})

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_xxx')
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      if (session.customer_email) {
        // Update Pro status in Supabase for subscription
        if (session.mode === 'subscription') {
          try {
            const { data: users } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', session.customer_email)
            
            if (users && users.length > 0) {
              await supabase
                .from('profiles')
                .update({ is_pro: true })
                .eq('email', session.customer_email)
            }
          } catch (error) {
            console.error('Error updating Pro status:', error)
          }
        }
      }
      break
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      // Handle gift purchases - if gift purchase, emit socket gift_received to partner
      if (paymentIntent.metadata && paymentIntent.metadata.giftType) {
        const { giftType, userId } = paymentIntent.metadata
        if (userId && users.has(userId)) {
          const user = users.get(userId)
          const senderSocketId = user.socketId
          const partnerSocketId = partners.get(senderSocketId)
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('gift_received', { gift: giftType, from: userId })
          }
        }
      }
      break
    }
  }
  res.json({ received: true })
})

const PORT = process.env.PORT || 4242
server.listen(PORT, ()=> console.log('NovaChat backend on port', PORT))
