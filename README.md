# 📝 notesMark

A modern full-stack notes application with sharing capabilities.

## 🚀 Features

- 🔐 JWT Authentication
- 📝 Create/Edit/Delete Notes
- 🔍 Real-time Search
- 🔗 Share Notes with Public Links
- 📱 Responsive Design

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, TailwindCSS  
**Backend:** Node.js, Express, MySQL, JWT

## ⚡ Quick Start


### Backend
```bash
cd server
npm install
cp .env.example .env  # Configure your database
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`



## 🔧 Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=notesMark
JWT_SECRET=your-secret
BASE_URL=http://localhost:5173
```

## 📡 API Endpoints
- `POST /api/auth/login` - Login
- `GET /api/notes` - Get notes
- `POST /api/notes/:id/share` - Share note

