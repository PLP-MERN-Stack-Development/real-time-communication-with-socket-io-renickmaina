# COmmunicator

A **real-time chat app** built with MERN stack and Socket.IO. Features secure authentication, online/offline indicators, typing status, and Instagram-inspired dark UI.

---

## Features

* Clerk JWT authentication
* Real-time messaging with Socket.IO
* Online/offline and typing indicators
* One-to-one conversations
* Dark Instagram-like theme with TailwindCSS
* Persistent chat history with MongoDB

---

## Project Structure

```
backend/   # Express API, MongoDB models, Socket.IO server
frontend/  # React + Vite client, TailwindCSS styling
```

---

## Setup

### Backend

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/meridian-chat
CLERK_SECRET_KEY=your_secret
CLERK_PUBLISHABLE_KEY=your_publishable_key
ALLOWED_ORIGINS=http://localhost:5173
```

3. Run server:

```bash
npm run dev
```

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create `.env`:

```
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

3. Run client:

```bash
npm run dev
```

---

## Testing

```bash
cd backend
npm test
```

---

## Usage

* Visit `http://localhost:5173`
* Login via Clerk
* Start chatting in real-time with online and typing indicators

---

## License

ISC
