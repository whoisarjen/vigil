# Vigil

Open source cron job monitoring with Statuspage.io and BetterUptime integration.

Know the moment your scheduled tasks fail. Vigil monitors your cron job endpoints and automatically updates your status page.

## Features

- **Cron Monitoring** — Monitor up to 5 endpoints on the free tier
- **Statuspage.io Integration** — Automatically update component status when checks fail
- **BetterUptime Integration** — Send heartbeat pings to keep your incident management in sync
- **7-Day History** — Visual timeline of check results with response times
- **Flexible Scheduling** — Check every 15 minutes, hourly, or daily
- **Google Sign-In** — Quick and secure authentication

## Tech Stack

- [Nuxt 4](https://nuxt.com) — Vue 3 framework with Nitro server
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first styling
- [Drizzle ORM](https://orm.drizzle.team) — Type-safe database access
- [Neon](https://neon.tech) — Serverless PostgreSQL
- [Vercel](https://vercel.com) — Deployment with cron support

## Getting Started

```bash
# Clone the repository
git clone https://github.com/whoisarjen/vigil.git
cd vigil

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values (see .env.example for details)

# Push database schema
npx drizzle-kit push

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NUXT_SESSION_PASSWORD` | Session encryption key (min 32 chars) |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CRON_SECRET` | Secret for authenticating cron requests |

## Self-Hosting

Deploy to Vercel:

1. Fork this repository
2. Import into Vercel
3. Set environment variables
4. Deploy — cron jobs are configured automatically via `vercel.json`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
