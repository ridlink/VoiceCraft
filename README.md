
# VoiceCraft AI - Text-to-Speech Generator

A modern web application for generating high-quality text-to-speech audio using AI.

## Prerequisites

- Node.js (v20.x or later)
- npm (v9.x or later)
- PostgreSQL database

## Environment Setup

1. Clone the repository from Replit
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add required environment variables:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
SESSION_SECRET=your_session_secret
```

## Database Setup

1. Create a PostgreSQL database
2. Run database migrations:
```bash
npm run db:push
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared types and schemas
└── attached_assets/ # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript checks
- `npm run db:push` - Update database schema

## Deployment

This project is designed to be deployed on Replit. To deploy:

1. Push your changes to your Replit repository
2. Use Replit's deployment feature:
   - Click the "Deploy" button in your workspace
   - Choose "Autoscale" deployment
   - Configure your environment variables
   - Deploy your application

Your application will be deployed with automatic scaling and HTTPS support.

## Features

- Text-to-speech generation
- User authentication
- Voice library management
- Real-time audio preview
- Responsive design
- Dark/Light theme support

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Shadcn/ui
- Backend: Express.js, Node.js
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js
- Deployment: Replit Autoscale
