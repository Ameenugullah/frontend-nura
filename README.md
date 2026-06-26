# Nura Bahar Nigeria — E-Commerce Store v3

Premium Nigerian fashion e-commerce built with **React 18 + Vite + TailwindCSS** frontend and a **PocketBase** backend. Fully Dockerized and production-ready.

---

## ✨ Features

- **Modern UI/UX** — Figma-faithful design with Cormorant Garamond + DM Sans typography, warm Nigerian palette, hover effects, responsive carousels
- **3 Main Sections** — Women's Collection, Men's Collection, Product Detail
- **Shopping Cart** — localStorage persistence, quantity management
- **Checkout** — Two payment flows:
  - **Paystack** — Inline popup for card/bank transfer/USSD
  - **WhatsApp** — Auto-formatted order message sent to admin WhatsApp
- **PocketBase Backend** — Products, Orders, Users, Newsletter collections
- **Admin Dashboard** — at `/admin` — Products CRUD, Order management, Customer list, stock tracking
- **Authentication** — Customer sign up/sign in/forgot password via PocketBase
- **Docker** — One-command deployment with `docker compose up`

---

## 🚀 Quick Start (Development)

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set your Paystack public key and WhatsApp number
```

### 3. Start PocketBase (backend)

```bash
# Download PocketBase for your OS from:
# https://github.com/pocketbase/pocketbase/releases

# macOS / Linux:
./pocketbase serve --dir=../backend/pb_data

# First run: visit http://localhost:8090/_/ to create admin account
```

### 4. Start frontend dev server

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### 5. Access Admin Dashboard

- Store: http://localhost:5173/admin
- PocketBase Admin UI: http://localhost:8090/_/

---

## 🐳 Docker Deployment (Production)

```bash
# 1. Copy and edit env (used at build time)
cp frontend/.env.example frontend/.env
# Edit VITE_PB_URL to your server's PocketBase URL

# 2. Build and start all services
docker compose up --build -d

# 3. Create PocketBase admin account (first run only)
# Visit: http://YOUR_SERVER_IP:8090/_/

# 4. Site is live at: http://YOUR_SERVER_IP
```

---

## 🔑 Paystack Integration

1. Create a Paystack account at https://paystack.com
2. Get your **Public Key** from Dashboard → Settings → API Keys
3. Set `VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key` in `.env`
4. Set up your **webhook** in Paystack dashboard to update order status automatically:
   - Webhook URL: `http://YOUR_DOMAIN/api/pb/api/collections/orders/records/:id`
   - You can also manually update status in the Admin Dashboard

---

## 📱 WhatsApp Integration

1. Set `VITE_ADMIN_WHATSAPP=2348XXXXXXXXX` in `.env` (your Nigerian number)
2. When a customer selects "WhatsApp" payment, a pre-formatted message with all order details is sent
3. Admin replies with payment details (account number / amount)
4. Admin manually marks the order as "processing" in the dashboard after payment confirmation

---

## 📂 Project Structure

```
nurabahar/
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProductCard, Ticker, MensCollection
│   │   ├── context/         # CartContext, AuthContext, AdminContext
│   │   ├── data/            # Static products (fallback when PocketBase offline)
│   │   ├── lib/             # pocketbase.js, api.js, paystack.js
│   │   └── pages/           # Home, Products, ProductDetail, Cart, Checkout,
│   │                        # Login, AdminDashboard, FAQ, ForgotPassword
│   ├── .env.example
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── pb_migrations/       # Auto-applied DB schema on first PB start
│   └── pb_hooks/            # Server-side JS hooks (order notifications)
├── docker/
│   └── nginx.conf           # Nginx config with SPA routing + PB proxy
├── Dockerfile.frontend      # Multi-stage: Vite build → nginx serve
├── Dockerfile.backend       # Alpine + PocketBase binary
├── docker-compose.yml       # Orchestrates frontend + backend
└── README.md
```

---

## 🛡️ Security

- No sensitive keys in source code — all via `.env` (excluded from git)
- PocketBase API rules: public can only create orders; reads/updates require auth
- Nginx security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip compression for all static assets
- HTTPS-ready (mount SSL certs in `docker/ssl/`)

---

## 🌍 Deployment Providers

| Provider | Steps |
|----------|-------|
| **Railway** | Connect repo → set env vars → deploy |
| **Render** | Docker deploy → set env vars |
| **VPS (Ubuntu)** | `docker compose up -d` after installing Docker |
| **Coolify** | Self-hosted PaaS — point to `docker-compose.yml` |

---

## 📞 Support

Built with ❤️ in Kano, Nigeria.

WhatsApp: +234 800 000 0000  
Email: hello@nurabahar.ng
