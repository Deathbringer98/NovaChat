
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import RandomChat from './pages/RandomChat'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import AuthPage from './pages/Auth'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <AuthPage mode="login" /> },
  { path: '/signup', element: <AuthPage mode="signup" /> },
  { path: '/chat', element: <RandomChat /> },
  { path: '/success', element: <Success /> },
  { path: '/cancel', element: <Cancel /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position="top-center" />
    <RouterProvider router={router} />
  </React.StrictMode>
)
