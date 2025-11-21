# LightMyFire

LightMyFire is a Next.js web application deployed on Vercel. It features sticker generation, ordering, payment processing, and content moderation.

## Features

*   **Sticker Generation**: Users can generate stickers using uploaded images.
*   **Ordering System**: Complete order flow with payment integration.
*   **Payments**: Secure payment processing via Stripe.
*   **Internationalization**: Support for multiple languages using `next-international`.
*   **Content Moderation**: AI-powered content moderation using OpenAI and AWS Rekognition.
*   **Map Integration**: Interactive maps using Leaflet.
*   **Email Notifications**: Automated emails using Resend.

## Tech Stack

*   **Framework**: Next.js
*   **Styling**: Tailwind CSS
*   **Backend & Database**: Supabase
*   **Payments**: Stripe
*   **Testing**: Vitest
*   **Language**: TypeScript

## Prerequisites

*   Node.js (v20 or later recommended)
*   npm or pnpm

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd lightmyfire-web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and fill in the required environment variables.
    ```bash
    cp .env.example .env.local
    ```
    Refer to `.env.example` for detailed descriptions of each variable.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm start`: Starts the production server.
*   `npm run lint`: Runs ESLint.
*   `npm test`: Runs tests using Vitest.
*   `npm run test:watch`: Runs tests in watch mode.
*   `npm run test:coverage`: Runs tests with coverage reporting.

## Environment Variables

The project relies on several environment variables for Supabase, Stripe, OpenAI, Resend, and other services. Please refer to `.env.example` for a comprehensive list and instructions on how to configure them.

## Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/`: React components.
*   `lib/`: Utility functions and libraries.
*   `locales/`: Localization files (copies of `en.ts` for build stability).
*   `translations/`: Original non-English locale files and maintenance scripts.
*   `supabase/`: Supabase configuration and migrations.
*   `tests/`: Test files.
*   `deepsource_mcp_custom/`: Custom MCP server implementation.

## Internationalization

Translation keys are managed in `locales/en.ts`.
*   **Source of Truth**: `locales/en.ts`
*   **Maintenance**: `translations/` contains scripts like `sync-locales.js` and `check-locale-sync.js` to help maintain translations.

## Custom MCP Server

The project includes a custom MCP (Model Context Protocol) server located in `deepsource_mcp_custom/`.

### Setup & Running

1.  Navigate to the directory:
    ```bash
    cd deepsource_mcp_custom
    ```
2.  Install dependencies (if not already installed):
    ```bash
    npm install
    ```
    **Note**: Ensure the `zod` dependency version matches the version used by `@modelcontextprotocol/sdk` (e.g., if sdk uses 3.25.x, zod should match or be compatible) to avoid type mismatches.
3.  Build the server:
    ```bash
    npm run build
    ```
4.  Run the server:
    ```bash
    npm start
    ```

**Environment**: The server requires `DEEPSOURCE_PAT` environment variable for authentication.

## Testing

Run unit tests with Vitest:

```bash
npm test
```

## Deployment

The application is designed to be deployed on Vercel.
1.  Push your code to a Git repository.
2.  Import the project into Vercel.
3.  Configure the environment variables in the Vercel dashboard.
4.  Deploy.

For detailed deployment checklists (deprecated but useful for reference), see `doc_deprecated/PRODUCTION_DEPLOYMENT_CHECKLIST.md`.
