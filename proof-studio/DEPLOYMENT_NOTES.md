# Deployment Notes

ProofStudio is built with Next.js and Prisma and is ready to be deployed to modern hosting platforms like Vercel, Railway, or Render.

## Prerequisites

Before deploying, ensure you have a PostgreSQL database available (or a similar database supported by Prisma). The default development setup uses SQLite, but production should use a robust relational database.

## Environment Variables

You must configure the following environment variables in your deployment environment:

- `DATABASE_URL`: Connection string to your production database. (e.g., `postgres://user:password@host:port/db`)
- `NEXT_PUBLIC_APP_BASE_URL`: The public base URL of your deployed application (e.g., `https://proofstudio.yourdomain.com`). This ensures that generated embed codes and public links point to the right place.
- `JWT_SECRET`: A strong, randomly generated string used to sign session cookies.
- `GEMINI_API_KEY`: Your Google Gemini API key for AI content generation features.

## Deployment Steps (Vercel)

1. **Push to GitHub:** Ensure your latest code is pushed to your main branch on GitHub.
2. **Import Project:** In the Vercel dashboard, click "Add New..." -> "Project" and import your ProofStudio repository.
3. **Configure Environment Variables:** In the configuration step, open the "Environment Variables" section and add the variables listed above.
4. **Deploy:** Click "Deploy". Vercel will automatically detect Next.js and run the correct `npm run build` command.
5. **Database Migration:** Once the database is ready, you will need to push the Prisma schema to your production database. You can do this by running `npx prisma db push` against your production database from your local machine, or set up a build step to do this automatically.

## Notes

- The build command is `next build` (standard for Next.js).
- The start command is `next start` (standard for Next.js).
- Ensure your `DATABASE_URL` uses connection pooling (e.g., PgBouncer) if deploying to a serverless environment like Vercel, by appending `?pgbouncer=true` to the connection string if required by your database provider.
