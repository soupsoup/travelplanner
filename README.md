# Travel Planner

A comprehensive travel planning application that helps users plan their trips using AI-powered recommendations, manage itineraries, and store important travel documents.

## Features

- AI-powered travel recommendations based on location, duration, and transportation preferences
- Hotel and accommodation search
- Attraction and activity recommendations
- Transportation options and booking
- Itinerary management and sharing
- Photo upload and trip notes
- Document storage for important travel documents
- User authentication and profile management

## Tech Stack

- Next.js 14
- TypeScript
- Prisma (PostgreSQL)
- TailwindCSS
- NextAuth.js
- Various Travel APIs (to be integrated)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your_postgresql_connection_string"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app directory containing pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 