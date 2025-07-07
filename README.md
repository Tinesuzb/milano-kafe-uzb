# 🍕 Milano Cafe - Premium Restaurant Management System

Modern, full-stack restaurant management system built with Next.js, TypeScript, and PostgreSQL.

## ✨ Features

### 🏪 **Customer Features**
- 🌐 Multi-language support (Uzbek, Russian, English)
- 📱 Fully responsive design
- 🛒 Shopping cart with real-time updates
- 📍 Location-based delivery
- 👤 User authentication & profiles
- 📋 Order history tracking
- 💳 Multiple payment methods

### 👨‍💼 **Admin Features**
- 📊 Real-time dashboard
- 📋 Order management with status tracking
- 👥 User management
- 📈 Analytics and reporting
- 🔄 Auto-refresh functionality

### 🛠️ **Technical Features**
- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS + shadcn/ui
- 🗄️ PostgreSQL with Neon
- 🔐 Secure authentication
- 📱 Mobile-first design
- 🚀 Production-ready

## 🚀 Quick Start

### 1. Clone & Install
\`\`\`bash
git clone https://github.com/yourusername/milano-cafe.git
cd milano-cafe
npm install
\`\`\`

### 2. Environment Setup
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local`:

### 3. Database Setup
\`\`\`bash
npm run db:setup
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` 🎉

## 🌐 Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
\`\`\`bash
git add .
git commit -m "Milano Cafe ready for production"
git push origin main
\`\`\`

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables:
  - `DATABASE_URL`: Your Neon database URL
  - Google Maps key → set in Vercel dashboard (do **not** commit it)

3. **Setup Database**
- Create [Neon](https://neon.tech) account
- Create new database
- Run setup script:
\`\`\`bash
npm run db:setup
\`\`\`

### Deploy to Other Platforms

#### Netlify
\`\`\`bash
npm run build
# Deploy .next folder
\`\`\`

#### Railway
\`\`\`bash
railway login
railway init
railway add
railway deploy
\`\`\`

## 📊 Database Schema

### Users
- Authentication & profile management
- Order history tracking

### Menu Items
- Multi-language support
- Category organization
- Price management

### Orders
- Real-time status tracking
- Location-based delivery
- Payment integration

### Admin
- Secure admin access
- Order management
- User analytics

## 🔧 Configuration

### Admin Access
- Default password: `admin123`
- Access: `/admin`

### Demo Mode
- Runs without database
- Perfect for testing
- In-memory storage

### Production Mode
- Real PostgreSQL database
- Persistent data storage
- Scalable architecture

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Menu
- `GET /api/menu` - Get menu items
- `GET /api/categories` - Get categories

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders
- `PATCH /api/orders/[id]` - Update order status

### Admin
- `GET /api/admin/users` - Get all users

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.ts`
- Replace logo in `components/header.tsx`
- Modify content in language files

### Features
- Add new menu categories
- Implement payment gateways
- Add email notifications
- Integrate SMS services

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ SQL injection protection
- ✅ Environment variable security
- ✅ Admin authentication
- ✅ Input validation

## 📈 Performance

- ✅ Server-side rendering
- ✅ Image optimization
- ✅ Code splitting
- ✅ Caching strategies
- ✅ Mobile optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- 📧 Email: support@milanocafe.uz
- 💬 Issues: GitHub Issues
- 📖 Docs: README.md

---

Made with ❤️ for Milano Cafe
