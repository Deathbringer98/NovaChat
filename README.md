
# NovaChat — Modern React + Tailwind chat UI

A fresh, trendy rebrand of your chat website. Built with **Vite + React + Tailwind + Zustand** and a drop-in **Socket.IO** client.

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:5173
```
Set backend/socket URL in `.env`:
```
VITE_SOCKET_URL=http://localhost:3001
```

## Structure
- `src/components/` — Sidebar, ChatHeader, MessageList, MessageInput, store
- `useChatStore` — state + Socket.IO events (replace backend URL)
- Glassy dark UI with brand gradient (#ff5a5f → #3fa8ff)

## Next steps
- Hook to your real backend events
- Add auth (Clerk/Auth0/Supabase) and profiles
- Add file uploads, emojis, typing indicators
- Add themes and brand pages
