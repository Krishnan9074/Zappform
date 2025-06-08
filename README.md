# ZappForm

ZappForm is an AI-powered form autofill solution that automatically fills any web form with your information, saving valuable time and eliminating repetitive data entry.

## Features

- **AI Persona Generation**: Creates a comprehensive profile by aggregating all your data
- **Intelligent Form Recognition**: Automatically detects forms on web pages
- **Document Processing**: Extracts information from uploaded documents
- **Secure User Data Management**: Encryption for sensitive information
- **Browser Extension**: One-click form filling on any website

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM with PostgreSQL
- **AI**: Google Generative AI
- **Vector DB**: Pinecone for embeddings and semantic search
- **Authentication**: NextAuth.js with multiple providers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Generative AI API key
- Pinecone account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/zappform.git
   cd zappform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database Connection
   DATABASE_URL="postgresql://username:password@localhost:5432/zappform"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"

   # Google OAuth (for authentication)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Google Generative AI
   GOOGLE_AI_API_KEY="your-google-ai-api-key"

   # Pinecone (Vector Database)
   PINECONE_API_KEY="your-pinecone-api-key"
   PINECONE_ENVIRONMENT="your-pinecone-environment"
   PINECONE_INDEX="your-pinecone-index-name"

   # JWT for Extension Auth
   JWT_SECRET="your-jwt-secret-here"
   ```

4. Set up the database:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder from this project

## Project Structure

- `app/` - Next.js application code
  - `api/` - API routes
  - `components/` - React components
  - `lib/` - Utility functions and libraries
- `prisma/` - Database schema and migrations
- `extension/` - Chrome extension code

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Google AI](https://ai.google/)
- [Pinecone](https://www.pinecone.io/)
- [TailwindCSS](https://tailwindcss.com/)
