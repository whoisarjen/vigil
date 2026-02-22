# Contributing to Vigil

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Copy `.env.example` to `.env` and fill in values
   - Create a [Neon](https://neon.tech) project for your database
   - Set up [Google OAuth credentials](https://console.cloud.google.com/apis/credentials)
   - Generate secrets: `openssl rand -base64 32` for session password, `openssl rand -hex 16` for cron secret
4. **Push database schema**: `npx drizzle-kit push`
5. **Start dev server**: `npm run dev`

## Making Changes

1. Create a branch from `main`
2. Make your changes
3. Test locally
4. Submit a pull request

## Code Style

- TypeScript strict mode
- Vue 3 Composition API with `<script setup>`
- Tailwind CSS for styling
- Follow existing patterns in the codebase

## Reporting Issues

Open an issue with a clear description and steps to reproduce.
