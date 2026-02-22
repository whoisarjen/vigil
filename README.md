# Vigil

The open source alternative to Statuspage and BetterUptime.

Monitor your services, manage incidents, and share a beautiful public status page. Free, open source, and self-hostable.

## Features

- **Uptime Monitoring** — Monitor up to 5 endpoints on the free tier
- **Public Status Page** — Share a branded status page with real-time service health
- **Incident Management** — Track and communicate incidents with timeline updates
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
4. Push database schema: `npx drizzle-kit push`
5. Deploy

### Setting Up Frequent Checks

Vercel's free tier only supports daily cron jobs. For more frequent monitoring (e.g. every 15 minutes), use a free external cron service:

1. Go to [cron-job.org](https://cron-job.org) (free, supports 1-minute intervals)
2. Create a new cron job with:
   - **URL**: `https://your-domain.vercel.app/api/cron/check`
   - **Schedule**: Every 15 minutes (or your preferred interval)
   - **HTTP Method**: GET
   - **Header**: `Authorization: Bearer YOUR_CRON_SECRET`
3. That's it — your monitors will now be checked at the configured frequency

You can also trigger checks manually from the dashboard using the **Run Checks** button.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
