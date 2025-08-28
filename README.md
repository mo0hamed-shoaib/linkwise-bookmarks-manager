# Linkwise - Bookmark Manager

A modern bookmark manager built with **Next.js 15**, **Supabase**, and **shadcn/ui**. Users can save, organize, and manage bookmarks with tags, categories, and favorites. Authentication is via Supabase Magic Link & OAuth login.

## Features

- 🔐 **Authentication**: Magic Link & OAuth (GitHub) login via Supabase
- 📚 **Bookmark Management**: Add, edit, delete, and organize bookmarks
- 🏷️ **Tags & Categories**: Organize bookmarks with tags and categories
- ⭐ **Favorites**: Mark important bookmarks as favorites
- 🔍 **Global Search**: Search across bookmarks, tags, and categories
- 🌙 **Dark/Light Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage)
- **Authentication**: Supabase Auth with Magic Link & OAuth
- **State Management**: React hooks, SWR for server state
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd linkwise-bookmark-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` and run it

### 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Add your site URL to the Site URL field (e.g., `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Main navigation
│   ├── sidebar.tsx       # Sidebar navigation
│   └── ...
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── supabase-server.ts # Server-side Supabase
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## Database Schema

The application uses three main tables:

- **bookmarks**: Stores bookmark data (title, URL, description, tags, etc.)
- **categories**: Stores bookmark categories
- **tags**: Stores bookmark tags

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Authentication Flow

1. User visits the app → redirected to `/auth` if not logged in
2. User can sign in with:
   - Magic Link (email)
   - OAuth (GitHub)
3. After successful authentication → redirected to `/dashboard`
4. Middleware protects all routes and handles authentication state

## Key Features Implementation

### Global Search
- Uses shadcn/ui Command component
- Searches across bookmarks, tags, and categories
- Keyboard shortcut: `Cmd/Ctrl + K`

### Bookmark Management
- Add bookmarks with title, URL, description, and tags
- View bookmarks in card or list format
- Mark bookmarks as favorites
- Delete bookmarks

### Organization
- Create and manage tags
- Create and manage categories
- Filter bookmarks by tags and categories

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you have any questions or need help, please open an issue on GitHub.
