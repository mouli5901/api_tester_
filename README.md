# 🚀 APIPlayground

**Test, save and share API requests — right in your browser.**

A lightweight, browser-based API testing and collection management tool built with React and Firebase. Think of it as a streamlined Postman alternative that lives entirely in your browser — no downloads, no installs.

---

## 📋 Problem Statement

| Who | What | Why |
|-----|------|-----|
| Frontend & backend developers | Need a quick way to test, organize, and share API endpoints | Desktop tools like Postman are heavy, and curl lacks a visual interface. Developers want something fast, organized, and shareable — right in the browser. |

---

## 🔗 Live Demo

> **[https://your-app.vercel.app](https://your-app.vercel.app)** *(placeholder — update after deployment)*

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **🔐 Email Auth** | Sign up and log in with email/password via Firebase Authentication |
| **📁 Collections** | Create, rename, and delete collections to organize API requests |
| **📨 Request Editor** | Full-featured editor with method selector, URL bar, headers, body, and auth tabs |
| **⚡ Live Execution** | Send real HTTP requests from the browser using `fetch()` with timeout and error handling |
| **📊 Response Viewer** | Status badges, latency, size, syntax-highlighted JSON body, and collapsible response headers |
| **🕑 Request History** | Last 20 requests stored in `localStorage` with one-click replay |
| **🔗 Share Links** | Generate public share links so anyone can view and run your saved requests |
| **📱 Responsive** | Fully responsive layout — works on desktop, tablet, and mobile |
| **🛡️ Error Boundary** | Graceful error handling with friendly retry screen |
| **🎨 Dark-First Design** | VS Code / Vercel-inspired dark theme with automatic light mode support |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 (Vite) |
| **Routing** | React Router v7 |
| **State Management** | Context API + `useReducer` |
| **Authentication** | Firebase Auth (email/password) |
| **Database** | Cloud Firestore |
| **HTTP Client** | Native `fetch()` API |
| **Styling** | Vanilla CSS with custom properties |
| **Fonts** | Inter + JetBrains Mono (Google Fonts) |
| **Build Tool** | Vite 8 |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Firebase project** with Authentication (email/password) and Firestore enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/apiplayground.git
cd apiplayground

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Fill in your Firebase credentials (see below)

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables. All values come from your Firebase project settings.

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## 🚢 Deployment on Vercel

### Step-by-step

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/apiplayground.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → **New Project**
   - Import your GitHub repository

3. **Configure Build Settings**
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

4. **Add Environment Variables**
   - In the Vercel dashboard → **Settings** → **Environment Variables**
   - Add all six `VITE_FIREBASE_*` variables from your `.env` file
   - Apply to **Production**, **Preview**, and **Development**

5. **Deploy**
   - Click **Deploy** — Vercel will build and deploy automatically
   - Every push to `main` triggers a new deployment

6. **Custom Domain** *(optional)*
   - Go to **Settings** → **Domains**
   - Add your custom domain and follow the DNS instructions

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ErrorBoundary/
│   │   └── ErrorBoundary.jsx
│   ├── HistoryPanel/
│   │   ├── HistoryPanel.jsx
│   │   └── HistoryPanel.css
│   ├── ProtectedRoute/
│   │   ├── ProtectedRoute.jsx
│   │   └── ProtectedRoute.css
│   ├── RequestEditor/
│   │   ├── RequestEditor.jsx
│   │   ├── ResponsePane.jsx
│   │   └── RequestEditor.css
│   ├── Spinner/
│   │   ├── Spinner.jsx
│   │   └── Spinner.css
│   └── Toast/
│       ├── Toast.jsx
│       └── Toast.css
├── context/
│   ├── AuthContext.jsx
│   └── CollectionContext.jsx
├── hooks/
│   ├── useHistory.js
│   └── useRequest.js
├── pages/
│   ├── CollectionView/
│   │   ├── CollectionView.jsx
│   │   └── CollectionView.css
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.css
│   ├── LoginPage/
│   │   ├── LoginPage.jsx
│   │   └── LoginPage.css
│   └── SharedView/
│       ├── SharedView.jsx
│       └── SharedView.css
├── services/
│   ├── authService.js
│   ├── collectionService.js
│   ├── firebase.js
│   ├── requestService.js
│   └── shareService.js
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

---



## 📄 License

This project was built as an end-term project. Feel free to fork and extend it.
