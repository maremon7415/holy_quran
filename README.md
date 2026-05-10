# Quran Web App

A modern, feature-rich Quran reading web application built with Next.js, designed for an exceptional reading experience across all devices with multilingual support, responsive design, and extensive personalization options.

![Quran Web App](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## Feature Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Left Icon Sidebar | ✅ Complete | Navigation sidebar with icons on desktop |
| Surah Sidebar (114 surahs) | ✅ Complete | Searchable list with Arabic & English names |
| Surah Navigation | ✅ Complete | Click to navigate to ayah page |
| Ayah Page (Surah Reader) | ✅ Complete | Full verses with number, Arabic, translation |
| Audio Playback | ✅ Complete | Per ayah play button + global player |
| Search Functionality | ✅ Complete | Search by Arabic or English text |
| Font Settings Panel | ✅ Complete | Multiple fonts + size sliders |
| Settings Persistence | ✅ Complete | localStorage via Zustand persist |
| Dark/Light Theme | ✅ Complete | next-themes with system support |
| Mobile Responsive | ✅ Complete | Collapsible drawer on mobile |

---

## Recent Bug Fixes

### 1. Arabic Verse Text Display Issue
**Problem**: Displayed Tafsir/explanatory text instead of actual Quranic verses.

**Root Cause**: API endpoint `ara-kingfahadquranc` was a Tafsir edition, not Quran text.

**Fix**: Changed to `ara-quranuthmani` → `ara-quransimple` edition in `lib/api.ts`.

**Files Modified**: 
- `lib/api.ts` line 219

### 2. Audio Player Close Button
**Problem**: Close button (X) on bottom audio player was not working.

**Root Cause**: `stopAudio` only set `isPlaying: false` but didn't reset surah/ayah state.

**Fix**: Updated `stopAudio` to reset `surahNumber` and `ayahNumber` to 1.

**Files Modified**:
- `lib/store.ts` line 584-586

### 3. Arabic Text Edge Alignment
**Problem**: Arabic text was too close to right edge, looking unpolished.

**Fix**: Added padding and improved RTL handling with proper unicodeBidi settings.

**Files Modified**:
- `components/quran/reader-panel.tsx` lines 225-232
- `components/ayah-item.tsx` lines 337-343

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Sources](#data-sources)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Performance](#performance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This Quran web application provides a comprehensive platform for reading, studying, and engaging with the Holy Quran. Built with modern web technologies, it offers a seamless experience across mobile, tablet, and desktop devices with features like:

- Complete Quran with Arabic text and multiple translations
- Audio recitation with renowned reciters
- Tafsir (exegesis) from classical scholars
- Prayer times and Qibla direction
- Du'a library and Dhikr counter
- Personal notes, bookmarks, and reading progress
- Daily reading goals and streak tracking
- Full multilingual support (English, Bengali, Arabic)
- PWA support for offline access

## Features

### Reading Experience

- **Complete Quran Access**: Browse all 114 surahs with full Arabic text
- **Multiple Translations**: English and Bengali translations side-by-side
- **Global Language Switching**: Switch interface language between English, Bangla, and Arabic
- **RTL Support**: Full right-to-left support for Arabic interface
- **Customizable Typography**: 
  - Adjustable surah title size and ayah text size
  - Multiple Arabic fonts (Amiri, Cairo, Scheherazade New)
  - Multiple English fonts (Inter, Outfit, Poppins)
  - Multiple Bangla fonts (Hind Siliguri, Noto Sans Bengali)
- **Audio Recitation**: 
  - Multiple reciters (Mishary Rashid Alafasy, Mahmoud Khalil Al-Husary, Mohamed Siddiq Al-Minshawi)
  - Ayah-by-ayah playback with auto-advance
  - Volume control and seek functionality
  - Background playback support
- **Tafsir Support**: 
  - Ibn Kathir commentary
  - Al-Jalalayn commentary
  - Ayah-by-ayah navigation
- **Personal Notes**: Add and manage notes on any ayah
- **Daily Reading Goals**: Set and track daily verse reading targets

### Navigation & User Interface

- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Mobile Navigation**: Slide-out navigation drawer for quick access
- **Search Functionality**: 
  - Quick surah search modal
  - Search by ayah translation (English & Bengali)
  - Advanced search with filters
- **Smooth Animations**: Framer Motion-powered transitions
- **Theme Support**: Dark mode, light mode, and system theme
- **Settings Drawer**: Floating panel for reading preferences
- **Quick Access**: Add frequently read surahs to quick access grid

### Personalization & User Features

- **Authentication**: 
  - Credential-based login/registration
  - Secure session management with NextAuth.js
  - MongoDB-backed user data
- **Saved Items**: 
  - Bookmark ayahs with custom tags
  - Favorite surahs
  - Important ayah tagging
  - Recent readings tracking
- **Reading Progress**: 
  - Per-surah progress tracking
  - Reading streak and statistics
  - Daily goal completion tracking
- **Persistent Preferences**: Local storage for user settings
- **Profile Management**: User profile with reading insights

### Prayer Times & Islamic Features

- **Prayer Times**: 
  - Accurate prayer times based on location
  - Multiple calculation methods
  - Automatic location detection
  - Prayer countdown timer
- **Qibla Compass**: 
  - Interactive compass with device orientation
  - Calibration tips for accuracy
  - Visual direction indicator
- **Islamic Calendar**: 
  - Hijri calendar view
  - Important Islamic dates
  - Month navigation
- **Du'a Library**: 
  - Categorized supplications
  - Arabic text with transliteration
  - English and Bengali translations
  - Daily dua feature
  - Search functionality
- **Dhikr Counter**: 
  - Digital tasbeeh with presets
  - Common dhikr counts (SubhanAllah, Alhamdulillah, AllahuAkbar)
  - Custom counter option
  - Haptic and audio feedback
- **Masayel**: 
  - Islamic rulings and questions database
  - Searchable by topic
  - Question and answer format
  - Multilingual support

### Technical Features

- **Modern Architecture**: App Router-based Next.js 16 application
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand with persistence
- **Responsive Layouts**: Mobile-first design approach
- **API Caching**: Reduced repeated requests
- **PWA Support**: 
  - Installable on mobile and desktop
  - Offline capability
  - Web app manifest
  - Service worker support
- **Performance Optimized**: 
  - Code splitting
  - Image optimization
  - Lazy loading
  - API response caching

## Tech Stack

### Core Framework
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5.7**: Type-safe JavaScript

### Styling & UI
- **Tailwind CSS 4.2**: Utility-first CSS framework
- **Framer Motion 12**: Animation library
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Icon library
- **next-themes**: Theme management

### State & Data
- **Zustand 5**: State management
- **MongoDB 7**: NoSQL database
- **Mongoose 9**: MongoDB object modeling
- **Axios**: HTTP client

### Authentication
- **NextAuth.js 5**: Authentication library
- **bcryptjs**: Password hashing
- **@auth/mongodb-adapter**: MongoDB adapter for NextAuth

### Islamic Features
- **Adhan 4.4**: Prayer time calculations
- **date-fns 4**: Date manipulation
- **Aladhan API**: Islamic calendar and events
- **QuranEnc API**: Tafsir data
- **Al Quran Cloud API**: Audio recitations

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Vercel Analytics**: Performance analytics

## Project Structure

```
quran/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── user/                 # User data endpoints
│   ├── calendar/                # Islamic calendar page
│   ├── dhikr/                   # Dhikr counter page
│   ├── dua/                     # Du'a library page
│   ├── login/                   # Login page
│   ├── masayel/                 # Islamic rulings page
│   ├── prayer-times/            # Prayer times page
│   ├── profile/                 # User profile page
│   ├── qibla/                   # Qibla compass page
│   ├── recent/                  # Recent readings page
│   ├── register/                # Registration page
│   ├── saved/                   # Saved items page
│   ├── surah/[id]/              # Individual surah page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
│
├── components/                   # React components
│   ├── audio-recitation.tsx     # Audio player for ayahs
│   ├── ayah-item.tsx            # Individual ayah display
│   ├── ayah-notes.tsx           # Personal notes component
│   ├── daily-goal-widget.tsx    # Daily reading goal tracker
│   ├── dhikr-counter.tsx        # Digital tasbeeh
│   ├── dua-card.tsx             # Du'a card component
│   ├── dua-of-the-day.tsx       # Daily dua feature
│   ├── hero-dashboard.tsx       # Homepage hero section
│   ├── hijri-calendar.tsx       # Hijri calendar component
│   ├── language-selection-modal.tsx  # Language switcher
│   ├── loading-spinner.tsx      # Loading indicator
│   ├── masayel-card.tsx         # Islamic rulings card
│   ├── navbar.tsx               # Main navigation bar
│   ├── prayer-countdown.tsx     # Prayer countdown timer
│   ├── prayer-times-widget.tsx  # Prayer times display
│   ├── qibla-compass.tsx        # Interactive Qibla compass
│   ├── qibla-widget.tsx         # Qibla direction widget
│   ├── quick-access-grid.tsx    # Quick access surahs
│   ├── search-modal.tsx         # Search functionality
│   ├── settings-drawer.tsx      # Settings panel
│   ├── shortcut-panel.tsx       # Quick shortcuts
│   ├── sidebar.tsx              # Mobile navigation
│   ├── stats-card.tsx           # Reading statistics
│   ├── surah-card.tsx           # Surah display card
│   ├── surah-slider.tsx         # Featured surahs carousel
│   ├── tafsir-viewer.tsx        # Quranic exegesis viewer
│   └── ui/                      # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       └── toast.tsx
│
├── hooks/                       # Custom React hooks
│   ├── use-geolocation.ts       # Location detection
│   ├── use-mobile.tsx           # Mobile detection
│   └── use-toast.ts             # Toast notifications
│
├── lib/                         # Utility libraries
│   ├── api.ts                   # Quran API integration
│   ├── db.ts                    # Database connection
│   ├── dua-data.ts              # Du'a data management
│   ├── i18n.ts                  # Internationalization
│   ├── masayel-data.ts          # Islamic rulings data
│   ├── prayer-api.ts            # Prayer time calculations
│   ├── store.ts                 # Zustand state management
│   └── utils.ts                 # Utility functions
│
├── models/                      # Database models
│   ├── Bookmark.ts              # Bookmark schema
│   └── User.ts                  # User schema
│
├── public/                      # Static assets
│   ├── data/
│   │   ├── duas.json            # Supplication data
│   │   ├── islamic-events.json  # Islamic events data
│   │   └── masayel.json         # Islamic rulings data
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # App icons
│
├── auth.ts                      # NextAuth configuration
├── components.json              # shadcn/ui configuration
├── next.config.mjs              # Next.js configuration
├── package.json                 # Project dependencies
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

---

## Production Readiness

### ✅ Production Ready Features

All core Quran reading features have been tested and are working:

| Component | Status | Last Tested |
|-----------|--------|-------------|
| Quran Reader | ✅ Working | Arabic text API fixed |
| Surah Navigation | ✅ Working | All 114 surahs accessible |
| Audio Playback | ✅ Working | Global player + per ayah |
| Search | ✅ Working | Arabic & English search |
| Settings Panel | ✅ Working | Fonts, sizes, persistence |
| Theme Toggle | ✅ Working | Dark/Light/System |
| Mobile Responsive | ✅ Working | Drawer navigation |

### Known Limitations

- Authentication requires MongoDB for full functionality
- Some external APIs may have rate limits
- Audio streaming depends on external Quran.com API

### Testing Checklist

- [x] Arabic text displays correctly (not Tafsir)
- [x] Audio player close button works
- [x] Arabic text edge alignment proper
- [x] Surah list displays all 114 surahs
- [x] Search returns accurate results
- [x] Font settings persist across sessions
- [x] Theme toggles correctly
- [x] Mobile drawer navigation works

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **pnpm** (recommended) or npm/yarn ([Installation](https://pnpm.io/installation))
- **MongoDB** database ([MongoDB Atlas](https://www.mongodb.com/atlas) or local installation)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/quran-web-app.git
cd quran-web-app
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Generate NextAuth secret**

```bash
openssl rand -base64 32
```

5. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/quran` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of your application | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-google-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-google-client-secret` |
| `GITHUB_ID` | GitHub OAuth client ID | `your-github-client-id` |
| `GITHUB_SECRET` | GitHub OAuth client secret | `your-github-client-secret` |

### Enabling OAuth Providers

To enable OAuth providers, uncomment the relevant sections in `auth.ts`:

```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Uncomment to enable Google OAuth
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    
    // Uncomment to enable GitHub OAuth
    // GitHub({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
  ],
  // ... rest of configuration
})
```

## Data Sources

The application integrates with several external APIs and data sources:

### Quran Data
- **Source**: JSDelivr-hosted Quran API resources
- **Content**: 
  - Surah list and metadata
  - Arabic Quranic text
  - English translations
  - Bengali translations

### Tafsir Data
- **Source**: QuranEnc API
- **Content**: 
  - Ibn Kathir commentary
  - Al-Jalalayn commentary

### Audio Recitations
- **Source**: Al Quran Cloud API
- **Content**: 
  - Multiple reciters' audio files
  - Ayah-by-ayah audio segments

### Prayer Times
- **Source**: Adhan library (calculation)
- **Features**: 
  - Multiple calculation methods
  - Location-based times
  - Automatic adjustments

### Islamic Calendar
- **Source**: Aladhan API
- **Content**: 
  - Hijri calendar dates
  - Islamic events and holidays

### Local Data
- **Du'a Library**: `public/data/duas.json`
- **Islamic Events**: `public/data/islamic-events.json`
- **Masayel**: `public/data/masayel.json`

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signin`
Sign in a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### POST `/api/auth/signout`
Sign out the current user.

### User Data Endpoints

#### GET `/api/user/bookmarks`
Get user's bookmarks.

**Response:**
```json
{
  "bookmarks": [
    {
      "surahNumber": 1,
      "ayahNumber": 1,
      "tags": ["important", "favorite"],
      "notes": "This ayah is very meaningful"
    }
  ]
}
```

#### POST `/api/user/bookmarks`
Create or update a bookmark.

**Request Body:**
```json
{
  "surahNumber": 1,
  "ayahNumber": 1,
  "tags": ["important"],
  "notes": "My note"
}
```

#### DELETE `/api/user/bookmarks`
Delete a bookmark.

**Request Body:**
```json
{
  "surahNumber": 1,
  "ayahNumber": 1
}
```

#### GET `/api/user/progress`
Get user's reading progress.

**Response:**
```json
{
  "progress": {
    "totalAyahsRead": 100,
    "currentStreak": 5,
    "dailyGoal": 20,
    "surahProgress": {
      "1": 7,
      "2": 286
    }
  }
}
```

### Quran Data Endpoints

#### GET `/api/quran/surahs`
Get list of all surahs.

**Response:**
```json
{
  "surahs": [
    {
      "number": 1,
      "name": "Al-Fatiha",
      "englishName": "The Opening",
      "englishNameTranslation": "The Opening",
      "numberOfAyahs": 7,
      "revelationType": "Meccan"
    }
  ]
}
```

#### GET `/api/quran/surah/:id`
Get details of a specific surah.

**Response:**
```json
{
  "surah": {
    "number": 1,
    "name": "Al-Fatiha",
    "ayahs": [
      {
        "number": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "translation": "In the name of Allah, the Most Gracious, the Most Merciful"
      }
    ]
  }
}
```

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

3. **Configure environment variables in Vercel dashboard**

4. **Set up MongoDB Atlas** (if using cloud database)

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t quran-app .
docker run -p 3000:3000 -e MONGODB_URI=your_uri quran-app
```

### Traditional Hosting

1. **Build the application**

```bash
pnpm build
```

2. **Upload the `.next` folder and `package.json`**

3. **Install dependencies on server**

```bash
npm install --production
```

4. **Start the application**

```bash
npm start
```

5. **Set up a process manager** (PM2 recommended)

```bash
npm install -g pm2
pm2 start npm --name "quran-app" -- start
pm2 startup
pm2 save
```

## Performance

### Optimization Strategies

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with WebP support
- **API Caching**: Reduced repeated API calls
- **Lazy Loading**: Components loaded on demand
- **Bundle Analysis**: Regular bundle size monitoring

### Monitoring

- **Vercel Analytics**: Performance metrics
- **Lighthouse Scores**: 
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 100

### Caching Strategy

- **Static Generation**: Pre-rendered pages where possible
- **ISR**: Incremental Static Regeneration for dynamic content
- **Client-side Caching**: LocalStorage for user preferences
- **API Response Caching**: Reduced server load

## Security

### Authentication Security

- **Password Hashing**: bcryptjs with salt rounds
- **Session Management**: Secure NextAuth.js sessions
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Rate Limiting**: API endpoint rate limiting

### Data Protection

- **Environment Variables**: Sensitive data in environment variables
- **MongoDB Security**: 
  - Connection string encryption
  - Role-based access control
  - IP whitelisting (Atlas)

### Best Practices

- **HTTPS Only**: Production deployments use HTTPS
- **Secure Headers**: 
  - Content Security Policy
  - X-Frame-Options
  - X-Content-Type-Options
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: MongoDB parameterized queries

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

**Problem**: Cannot connect to MongoDB database

**Solution**: 
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist
3. Ensure database user has correct permissions
4. Check network connectivity

#### NextAuth Session Issues

**Problem**: Users are being logged out frequently

**Solution**:
1. Verify `NEXTAUTH_SECRET` is set
2. Check cookie settings in browser
3. Ensure `NEXTAUTH_URL` matches your domain
4. Clear browser cookies and try again

#### Build Errors

**Problem**: TypeScript build errors

**Solution**:
1. Run `pnpm lint` to identify issues
2. Check `tsconfig.json` configuration
3. Ensure all dependencies are installed
4. Clear `.next` folder and rebuild

#### Audio Not Playing

**Problem**: Quran audio recitation not working

**Solution**:
1. Check internet connection
2. Verify browser supports HTML5 audio
3. Clear browser cache
4. Try different reciter

#### Prayer Times Incorrect

**Problem**: Prayer times don't match local mosque

**Solution**:
1. Verify location permissions
2. Check calculation method in settings
3. Adjust manual time offsets if needed
4. Ensure device location is accurate

### Debug Mode

Enable debug logging:

```env
NEXTAUTH_DEBUG=true
NODE_ENV=development
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/quran-web-app/issues)
- **Documentation**: Check this README first
- **Community**: Join our Discord server

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Found an issue? Let us know
- 💡 **Suggest Features**: Have an idea? Share it
- 🎨 **Improve UI/UX**: Make it look better
- ♿ **Improve Accessibility**: Make it usable for everyone
- 📝 **Improve Documentation**: Help others understand the code
- 🌍 **Add Translations**: Support more languages
- ✅ **Add Tests**: Improve code coverage
- 🔧 **Refactor Code**: Make it more maintainable

### Contribution Guidelines

1. **Fork the repository**

2. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**

4. **Follow the code style**

```bash
pnpm lint
```

5. **Commit your changes**

```bash
git commit -m "feat: add your feature description"
```

Use conventional commit messages:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

6. **Push to your branch**

```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**

- Describe your changes clearly
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Roadmap

### Completed ✅

All core Quran reading features are implemented:
- [x] Left icon sidebar navigation
- [x] Complete 114 surahs with Arabic & English names
- [x] Surah reader with verse-by-verse display
- [x] Arabic text with proper Quranic font rendering
- [x] English (Saheeh International) & Bengali translations
- [x] Per-ayah audio playback with global player
- [x] Multiple reciters support (Alafasy, Husary, etc.)
- [x] Surah search functionality
- [x] Ayah search by Arabic/English text
- [x] Font settings (5 Arabic fonts, 3 English, 3 Bangla)
- [x] Font size adjustment (Arabic & Translation)
- [x] Settings persistence via localStorage
- [x] Dark/Light theme with system preference
- [x] Mobile responsive with collapsible drawers
- [x] Tafsir viewer (Ibn Kathir & Al-Jalalayn)
- [x] Daily reading goals
- [x] Notes and highlights
- [x] Bookmarks and favorites
- [x] PWA support
- [x] Prayer times with location detection
- [x] Qibla compass
- [x] Du'a library
- [x] Dhikr counter
- [x] Islamic calendar
- [x] Masayel database

### In Progress 🚧

- [ ] OAuth login enablement (Google, GitHub)
- [ ] Better profile insights and statistics

### Planned 📋

- [ ] Word-by-word translation
- [ ] Memorization tools (Hifz tracker)
- [ ] Offline support improvements
- [ ] Social sharing features
- [ ] Community features
- [ ] More language translations
- [ ] Recitation comparison
- [ ] Reading plans (Juz, Hizb)
- [ ] Export notes and bookmarks
- [ ] Voice search

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

### Core Technologies

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Lucide](https://lucide.dev/) - Icons

### Data Sources

- [Quran.com API](https://quran.com/docs/api) - Quran data
- [QuranEnc](https://quranenc.com/) - Tafsir data
- [Al Quran Cloud](https://alquran.cloud/) - Audio recitations
- [Adhan](https://github.com/batoulapps/adhan-js) - Prayer times
- [Aladhan API](https://aladhan.com/) - Islamic calendar

### Special Thanks

- The open-source community for amazing tools and libraries
- Contributors who have helped improve this project
- Users who provide feedback and suggestions

### Islamic Resources

- Quranic text and translations from trusted sources
- Tafsir from classical Islamic scholars
- Authentic Du'a collections
- Reliable prayer time calculations

---

**Made with ❤️ for the Muslim community**

If you find this project helpful, please consider giving it a ⭐ on GitHub!
