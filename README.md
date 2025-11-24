# LightMyFire

LightMyFire is a Next.js web application designed to track the journey of lighters around the world. It allows users to "save" lighters, attach stories to them, and visualize their travel paths on a map.

The project features a full-stack architecture with:
*   **Frontend**: Next.js (App Router), React, Tailwind CSS.
*   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions).
*   **Payments**: Stripe integration for ordering stickers.
*   **Content Moderation**: AI-powered moderation using OpenAI and AWS Rekognition.
*   **Fulfillment**: Printful integration for on-demand sticker printing.
*   **Internationalization**: Multi-language support via `next-international`.

## Features

*   **Lighter Tracking**: Unique PIN codes for every lighter to track its history.
*   **Sticker Generation**: Create custom stickers with QR codes for physical lighters.
*   **Ordering System**: Integrated e-commerce flow for purchasing sticker packs.
*   **Interactive Maps**: Visualize the global journey of each lighter.
*   **Community Stories**: Users can post text, images, and songs associated with a lighter's location.
*   **Gamification**: User levels and achievements based on contributions.

## Tech Stack

*   **Framework**: Next.js 14+ (TypeScript)
*   **Styling**: Tailwind CSS
*   **Database**: Supabase (PostgreSQL)
*   **Authentication**: Supabase Auth
*   **Payments**: Stripe
*   **Fulfillment**: Printful API
*   **Maps**: Leaflet / React-Leaflet
*   **Testing**: Vitest
*   **Linting**: ESLint, Stylelint

## Prerequisites

*   Node.js (v20 or later recommended)
*   npm or pnpm
*   A Supabase project
*   Stripe account (for payments)
*   Printful account (for fulfillment)

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
    Copy `.env.example` to `.env.local` and fill in the required variables.
    ```bash
    cp .env.example .env.local
    ```
    **Critical Variables**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
    *   `SUPABASE_SERVICE_ROLE_KEY`: For admin/server-side operations.
    *   `STRIPE_SECRET_KEY`: For processing payments.
    *   `PRINTFUL_API_KEY`: For sticker order fulfillment.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

*   `app/`: Next.js App Router (pages, layouts, API routes).
    *   `[locale]/`: Localized routes (e.g., `/en/about`).
    *   `api/`: Backend API endpoints.
    *   `components/`: Application-specific components.
*   `components/`: Shared/Generic React components.
*   `lib/`: Core utilities, hooks, and service integrations.
    *   `supabase.ts`: Client-side Supabase client.
    *   `supabase-server.ts`: Server-side Supabase client.
    *   `printful.ts`: Printful API wrapper.
*   `locales/`: Localization files (copies of `en.ts` for build stability).
*   `translations/`: Source translation files and sync scripts.
*   `deepsource_mcp_custom/`: Custom Model Context Protocol server for DeepSource integration.
*   `tests/`: Unit and integration tests (Vitest).

## Documentation Standards

This repository follows strict documentation guidelines to ensure maintainability and clarity.

*   **JSDoc**: Every public function, class, and component must have a comprehensive JSDoc block.
    *   **Description**: Clear explanation of purpose.
    *   **@param**: Detailed description of each parameter.
    *   **@returns**: Description of the return value.
*   **Components**: React components include descriptions of their UI role and Props interface documentation.
*   **API Routes**: Route handlers include descriptions of their request/response logic and side effects.

## Scripts

*   `npm run dev`: Start development server.
*   `npm run build`: Build for production.
*   `npm start`: Start production server.
*   `npm run lint`: Run ESLint.
*   `npm test`: Run tests with Vitest.
*   `npm run test:watch`: Run tests in watch mode.

## Custom MCP Server

The project includes a custom MCP (Model Context Protocol) server in `deepsource_mcp_custom/` that integrates with DeepSource to fetch code issues.

### Setup & Running
1.  `cd deepsource_mcp_custom`
2.  `npm install` (Ensure `zod` version matches `@modelcontextprotocol/sdk` requirements).
3.  `npm run build`
4.  Set `DEEPSOURCE_API_KEY` in environment.
5.  `npm start`

## Deployment

The application is optimized for deployment on Vercel.
1.  Push code to your Git repository.
2.  Import project into Vercel.
3.  Configure all environment variables in Vercel settings.
4.  Deploy.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

Please ensure all new code is fully documented according to the standards above.
