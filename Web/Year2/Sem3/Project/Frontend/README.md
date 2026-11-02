# PulseChat | Real-time Conversation Platform

A clean, modern chat application built for the **Year 2 Sem 3 Web Development Project**, connecting directly to **MongoDB Atlas**.

---

## 🌟 Highlights & Key Features

- **App Name: PulseChat**:
  - Distinct modern interface inspired by professional messaging platforms (Google Chat, Slack, WhatsApp Web).
  - Clean emerald-slate visual design with Dark and Light mode theme toggle.

- **MongoDB Atlas Email Search**:
  - Live search bar and **Start New Chat** modal querying registered user emails directly in your MongoDB Atlas cloud database (`GET /user/search?email=...`).
  - Search results display the user's registered name and email with an **"Initiate Chat"** action.
  - Selecting a matching user immediately opens an active conversation thread.

- **Zero Mock / AI Data**:
  - Completely clean slate: no AI bots, no fake teammates, no hardcoded sample messages.
  - Conversations are initiated between real registered users.
  - Conversations and sent messages persist per logged-in account in `localStorage`.

- **Real Authentication & Security**:
  - No guest or demo bypass modes.
  - **Register**: Hashed with `bcrypt` (5 salt rounds) and stored in MongoDB Atlas.
  - **Login**: Authenticates against MongoDB Atlas and issues a cryptographically signed JWT token.
  - **Protected Route**: Verifies sessions using backend `/dashboard` auth middleware.

---

## 🚀 Running the Project

### 1. Start the Backend Server (Port 8080)
```bash
cd ~/Downloads/Projects/Web/Year2/Sem3/Project/Backend
npm run server
```
*Output: `DB Connected` & `Server started` (connected to MongoDB Atlas).*

### 2. Start the Frontend Dev Server (Port 5173)
```bash
cd ~/Downloads/Projects/Web/Year2/Sem3/Project/Frontend
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 💡 How to Test with Multiple Users

1. Open **`http://localhost:5173`** and create an account (e.g. `user1@college.edu`).
2. Search for any registered email in MongoDB Atlas (e.g. `testchat@college.edu` or `nayanjinal23@gmail.com`).
3. Click on the matched user to initiate the chat and send messages.
4. You can also open an Incognito tab, register another user, search for `user1@college.edu`, and chat between them!
