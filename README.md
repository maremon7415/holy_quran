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

### Navigation and UI
- Responsive homepage with featured sections
- Mobile navigation slider for quick access
- Search modal for finding surahs quickly
- Smooth transitions and animations across the interface
- Dark mode, light mode, and system theme support
- Floating settings drawer for reading preferences

### Personalization and User Features
- Authentication with credentials
- Register and login pages
- Saved items page
- Bookmark ayahs
- Favorite surahs
- Important ayah tagging
- Recent readings
- Reading progress tracking
- Reading streak and reading stats
- Persistent user preferences with local storage

### Technical Features
- App Router based Next.js application
- Zustand state management with persistence
- Responsive layouts for mobile, tablet, and desktop
- API caching to reduce repeated requests
- TypeScript-based codebase
- MongoDB-backed auth and user data flow

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

## Project Structure

```text
app/
  api/
  login/
  profile/
  recent/
  register/
  saved/
  surah/[id]/
  globals.css
  layout.tsx
  page.tsx

components/
  navbar.tsx
  sidebar.tsx
  ayah-item.tsx
  hero-dashboard.tsx
  language-selection-modal.tsx
  quick-access-grid.tsx
  search-modal.tsx
  shortcut-panel.tsx
  stats-card.tsx
  surah-card.tsx
  surah-slider.tsx
  ui/

lib/
  api.ts
  db.ts
  i18n.ts
  store.ts
  utils.ts

models/
  Bookmark.ts
  User.ts

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
GITHUB_SECRET=your_github_client_secret
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

### Saved and Tracked Reading
- Bookmark verses
- Mark important ayahs with tags
- Save favorite surahs
- Track recently viewed surahs
- Track progress and reading streaks

### Responsive Experience
- Mobile-friendly navigation drawer
- Responsive homepage sections
- Responsive cards and grid layouts
- Mobile-aware tabs and controls

## Roadmap

We plan to add more features as the project grows. Possible upcoming improvements include:

- Audio recitation support
- Tafsir support
- Better authentication options
- OAuth login enablement
- Advanced search
- Word-by-word translation
- Daily reading goals
- Notes and highlights
- Better profile insights
- Admin/content tools
- Offline support or caching improvements
- PWA support

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
- JSDelivr Quran API resources

