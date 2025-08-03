# ✨ Luxe Travel Planner

A sophisticated travel planning application with luxury design and AI-powered itinerary creation. Plan extraordinary journeys with comprehensive budget tracking, day-by-day scheduling, and elegant user experience. Updated with new API key.

![Luxe Travel Planner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

## 🌟 Key Features

### 🤖 **AI-Powered Trip Builder**
- **Sophisticated Wizard Interface**: Step-by-step guided experience
- **Intelligent Recommendations**: Personalized suggestions based on travel style, interests, and preferences
- **Smart Planning**: AI analyzes your preferences to create perfect itineraries

### 📅 **Comprehensive Itinerary Management**
- **Day-by-Day Planning**: Detailed timeline views with activities and accommodations
- **Activity Tracking**: Manage attractions, restaurants, and entertainment with booking details
- **Accommodation Management**: Hotel, Airbnb, and other lodging with reservation tracking
- **Transportation Planning**: Flight, train, car rental coordination

### 💰 **Advanced Budget Tracking**
- **Category-based Budgeting**: Accommodation, food, activities, transportation, shopping, miscellaneous
- **Expense Management**: Track actual spending vs. planned budget
- **Real-time Calculations**: Dynamic budget updates and totals

### 🎨 **Luxury Design Language**
- **Sophisticated Color Palette**: Deep navy (#1a365d) and warm gold (#d69e2e) accents
- **Premium Typography**: Inter font with smooth animations
- **Card-based Layouts**: Elegant shadows and transitions
- **Mobile-first Responsive**: Beautiful on all devices

### 📊 **Dashboard & Analytics**
- **Trip Overview**: Visual stats for all itineraries
- **Progress Tracking**: Monitor completed vs. planned activities
- **Search & Filter**: Advanced filtering by status, destination, dates
- **Status Management**: Planning, confirmed, completed trip states

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom design system
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Anthropic Claude API
- **TypeScript**: Full type safety throughout

### **Project Structure**
```
app/
├── ai-builder/          # AI-powered itinerary creation wizard
├── dashboard/           # Main dashboard with trip overview
├── itinerary/
│   ├── new/            # Manual itinerary creation
│   └── [id]/           # Individual itinerary views
├── api/                # Backend API routes
├── components/         # Reusable UI components
├── types/              # TypeScript type definitions
└── globals.css         # Luxury design system styles

lib/
├── auth.ts             # NextAuth configuration
└── prisma.ts           # Database client

prisma/
└── schema.prisma       # Database schema
```

## 🚀 Quick Start

### 1. **Clone & Install**
```bash
git clone https://github.com/yourusername/travelplanner.git
cd travelplanner
npm install
```

### 2. **Environment Setup**
Create `.env` file:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ANTHROPIC_API_KEY="your-anthropic-key"
```

### 3. **Database Setup**
```bash
npx prisma db push
npx prisma generate
```

### 4. **Run Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your luxury travel planner!

## 🎯 Usage Guide

### **Creating Your First Itinerary**

1. **AI Builder Route** (`/ai-builder`):
   - Answer guided questions about destination, dates, preferences
   - AI generates comprehensive itinerary
   - Review and customize before saving

2. **Manual Builder Route** (`/itinerary/new`):
   - Set trip details and generate day structure
   - Add activities, accommodations, and notes for each day
   - Real-time budget tracking and calculations

### **Dashboard Features**
- View all itineraries with status indicators
- Search by destination or trip name
- Filter by planning status (planning, confirmed, completed)
- Quick stats overview (total trips, countries, budget, ratings)

## 🔧 Customization

### **Design System**
All design tokens are defined in `tailwind.config.js` and `globals.css`:
- Colors: Navy deep, gold warm, soft grays
- Typography: Inter font family with luxury spacing
- Components: Reusable `.btn-primary`, `.btn-secondary`, `.card-luxury` classes

### **Adding New Features**
The modular architecture makes it easy to extend:
- Add new activity types in `types/index.ts`
- Create new UI components in `app/components/`
- Extend API functionality in `app/api/`

## 📱 Deployment

Ready for production! See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides including:
- Vercel (recommended)
- Railway
- Netlify
- GitHub Actions CI/CD

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from luxury travel brands
- Icons by [Lucide React](https://lucide.dev/)
- Images from [Unsplash](https://unsplash.com/)

---

**🎉 Ready to create extraordinary travel experiences!** Start planning your next adventure with Luxe Travel Planner. 