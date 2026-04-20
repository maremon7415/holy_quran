# Quran Web App

A modern Quran reading web application built with Next.js, focused on a smooth reading experience, multilingual access, responsive design, and user-friendly customization.

This project is actively evolving. More features will be added over time, and contributions are welcome from anyone interested in improving the app.

## Overview

The app is designed to make Quran reading simple and comfortable across mobile, tablet, and desktop. It includes global language switching, theme support, responsive layouts, search, reading progress features, saved items, and customizable reading settings.

## Current Features

### Reading Experience
- Browse all 114 surahs
- Read full surahs with Arabic text
- Read English and Bengali translations
- Choose reading language globally across the website
- Switch between English, Bangla, and Arabic interface language
- Right-to-left support for Arabic
- Language-based global font switching
- Adjustable surah title size and ayah text size
- Multiple Arabic, English, and Bangla font options
- **Audio Recitation**: Listen to ayahs with multiple reciters (Alafasy, Husary, Minshawi)
- **Tafsir Support**: View Quranic exegesis from Ibn Kathir and Al-Jalalayn
- **Ayah Notes**: Add personal notes to any ayah
- **Daily Reading Goals**: Set and track your daily verse reading targets

### Navigation and UI
- Responsive homepage with featured sections
- Mobile navigation slider for quick access
- Search modal for finding surahs quickly
- Search by ayah translation (English & Bengali)
- Smooth transitions and animations across the interface
- Dark mode, light mode, and system theme support
- Floating settings drawer for reading preferences
- **Quick Access**: Add frequently read surahs to quick access

### Personalization and User Features
- Authentication with credentials
- Register and login pages
- Saved items page with multiple tabs
- Bookmark ayahs
- Favorite surahs
- Important ayah tagging with custom tags
- Recent readings tracking
- Reading progress tracking for each surah
- Reading streak and reading stats
- Persistent user preferences with local storage
- **Daily Reading Goals**: Set customizable daily verse targets
- **Personal Notes**: Write and save notes on any ayah

### Prayer Times & Islamic Features
- **Prayer Times**: Accurate prayer times based on your location
- **Prayer Countdown**: See time remaining until next prayer
- **Qibla Compass**: Interactive compass with device orientation support
- **Islamic Calendar**: Hijri calendar with important dates
- **Du'a Library**: Collection of authenticated supplications with Arabic, transliteration and translations
- **Dhikr Counter**: Digital tasbeeh with presets (SubhanAllah, Alhamdulillah, etc.)
- **Masayel**: Islamic rulings and questions database
- **Location-based**: Auto-detects location for prayer times and Qibla direction

### Technical Features
- App Router based Next.js application
- Zustand state management with persistence
- Responsive layouts for mobile, tablet, and desktop
- API caching to reduce repeated requests
- TypeScript-based codebase
- MongoDB-backed auth and user data flow
- **PWA Support**: Installable app with offline capability
- **Manifest**: Web app manifest for mobile installation

## Tech Stack

- Framework: Next.js 16
- Language: TypeScript
- UI: React 19
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- State Management: Zustand
- Authentication: NextAuth.js v5 beta
- Database: MongoDB / Mongoose
- Theme Handling: next-themes
- UI Primitives: Radix UI
- Icons: Lucide React
- API Client: Axios
- Analytics: Vercel Analytics
- Prayer Times: Adhan library
- Date Handling: date-fns

## Project Structure

```text
app/
├── api/
├── login/
├── profile/
├── recent/
├── register/
├── saved/
├── surah/[id]/
├── calendar/
├── dhikr/
├── dua/
├── masayel/
├── prayer-times/
├── qibla/
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── audio-recitation.tsx    # Audio player for ayahs
├── ayah-item.tsx           # Individual ayah display
├── ayah-notes.tsx          # Personal notes component
├── daily-goal-widget.tsx   # Daily reading goal tracker
├── dhikr-counter.tsx       # Digital tasbeeh
├── dua-card.tsx
├── dua-of-the-day.tsx
├── hero-dashboard.tsx
├── hijri-calendar.tsx
├── language-selection-modal.tsx
├── masayel-card.tsx
├── prayer-countdown.tsx
├── prayer-times-widget.tsx
├── qibla-compass.tsx       # Interactive Qibla compass
├── qibla-widget.tsx
├── quick-access-grid.tsx
├── search-modal.tsx
├── shortcut-panel.tsx
├── stats-card.tsx
├── surah-card.tsx
├── surah-slider.tsx
├── tafsir-viewer.tsx       # Quranic exegesis viewer
└── ui/                     # Reusable UI components

lib/
├── api.ts                  # Quran API integration
├── db.ts                   # Database connection
├── dua-data.ts             # Dua data management
├── i18n.ts                 # Internationalization
├── masayel-data.ts         # Islamic rulings data
├── prayer-api.ts           # Prayer time calculations
├── store.ts                # Zustand state management
└── utils.ts

hooks/
├── use-geolocation.ts      # Location detection hook
├── use-mobile.tsx
└── use-toast.ts

models/
├── Bookmark.ts
└── User.ts

public/
├── data/
│   ├── duas.json           # Supplication data
│   ├── islamic-events.json
│   └── masayel.json        # Islamic rulings data
└── manifest.json           # PWA manifest

auth.ts
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm recommended
- MongoDB database

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root and configure the required values.

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Optional OAuth Providers

OAuth providers are prepared in the auth config but currently commented out. If you want to enable them later, add values like these:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_secret
```

Then uncomment the matching providers in [auth.ts](/home/emon/Downloads/quran/auth.ts).

### Run the Development Server

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

### Production Commands

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

## Data Sources

The app uses Quran data served from JSDelivr-hosted Quran API resources.

This currently powers:
- Surah list
- Surah details
- Arabic text
- English translation
- Bengali translation

Tafsir data is provided by QuranEnc API.
Audio recitations are from Al Quran Cloud API.
Prayer times are calculated using the Adhan library.

## Main Functional Areas

### Global Language System
- Default language is English
- Switching language from the navbar updates the full site
- English uses Outfit
- Bangla uses Hind Siliguri
- Arabic uses Cairo
- Arabic UI also updates document direction to RTL

### Reading Settings
- Adjustable font sizes
- Font family customization
- Theme switching
- Settings drawer available on desktop and mobile
- Language selection per surah reading

### Audio Recitation
- Multiple renowned reciters available
- Ayah-by-ayah playback
- Auto-advance to next ayah
- Volume control with mute option
- Seek functionality
- Works seamlessly while reading

### Tafsir (Exegesis)
- Ibn Kathir commentary
- Al-Jalalayn commentary
- Ayah-by-ayah navigation
- Smooth modal interface

### Notes & Bookmarks
- Bookmark any ayah for quick access
- Add multiple custom tags to ayahs
- Write personal notes on ayahs
- All data persists in local storage
- Access via Saved page

### Prayer Times & Qibla
- Automatic location detection
- Support for multiple calculation methods
- Countdown to next prayer
- Interactive Qibla compass with device orientation
- Calibration tips for accuracy

### Dhikr Counter
- Preset counts: SubhanAllah (33), Alhamdulillah (33), AllahuAkbar (34)
- Additional presets: Astaghfirullah, La hawla wa la quwwata, etc.
- Custom counter option
- Haptic feedback on tap
- Audio feedback option
- Progress visualization

### Du'a Library
- Categorized supplications
- Search functionality
- Arabic text with transliteration
- English and Bengali translations
- Daily dua feature on homepage

### Islamic Calendar
- Hijri calendar view
- Month navigation
- Important Islamic dates
- Aladhan API integration

### Masayel (Islamic Rulings)
- Searchable database
- Categorized by topic
- Question and answer format
- English and Bengali support

### Saved and Tracked Reading
- Bookmark verses
- Mark important ayahs with tags
- Save favorite surahs
- Track recently viewed surahs
- Track progress and reading streaks
- Personal notes on ayahs
- Daily reading goal tracking

### Responsive Experience
- Mobile-friendly navigation drawer
- Responsive homepage sections
- Responsive cards and grid layouts
- Mobile-aware tabs and controls
- PWA install support

## PWA (Progressive Web App)

The app supports PWA features:
- **Installable**: Can be installed on mobile and desktop
- **Offline Ready**: Basic functionality works offline
- **Manifest**: Properly configured web app manifest
- **Icons**: Multiple icon sizes for different devices
- **Shortcuts**: Quick access to Prayer Times, Qibla, and Du'a

## Roadmap

We plan to add more features as the project grows. Possible upcoming improvements include:

- ~~Audio recitation support~~ ✅ Added
- ~~Tafsir support~~ ✅ Added
- ~~Daily reading goals~~ ✅ Added
- ~~Notes and highlights~~ ✅ Added
- ~~PWA support~~ ✅ Added
- Better authentication options
- OAuth login enablement
- Advanced search with filters
- Word-by-word translation
- Better profile insights
- Admin/content tools
- Offline support improvements
- Social sharing features
- Community features
- Memorization tools (Hifz)

## Contributing

Contributions are welcome.

If you are interested in improving the app, fixing issues, adding features, refining UI/UX, improving accessibility, or helping with performance, feel free to contribute.

### Ways to Contribute

- Report bugs
- Suggest features
- Improve responsive design
- Add tests
- Improve accessibility
- Improve translations
- Add new reading features
- Refactor code for maintainability
- Improve documentation

### Basic Contribution Flow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with clear messages
5. Open a pull request

If you want to contribute but are not sure where to start, open an issue or start with documentation, UI polish, or small bug fixes.

## Notes

- This project is still growing and more features will be added.
- Some auth provider setup is prepared but not yet enabled by default.
- Interface details may continue to evolve as the product improves.
- Audio recitation requires internet connection.
- Qibla compass works best when device is calibrated.

## License

Please add the license of your choice if you want to make the repository usage terms explicit.

## Acknowledgements

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Zustand
- NextAuth.js
- Radix UI
- Lucide
- MongoDB
- Adhan library
- Aladhan API
- QuranEnc API
- Al Quran Cloud API
- JSDelivr Quran API resources
