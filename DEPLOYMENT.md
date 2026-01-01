# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the MESG messenger application on Railway.

## Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app) and connect your GitHub account
3. **Telegram Bot**: Create a bot via [@BotFather](https://t.me/botfather) on Telegram

## Part 1: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to:
   - Choose a display name for your bot (e.g., "MESG Verifier")
   - Choose a username for your bot (must end in 'bot', e.g., "mesg_verifier_bot")
4. Save the **bot token** (looks like `123456:ABC-DEF1234...`)
5. Save the **bot username** (e.g., `mesg_verifier_bot`)

## Part 2: Deploy to Railway

### Step 1: Create New Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `mesg` repository
5. Railway will create an empty project

### Step 2: Add PostgreSQL Database

1. In your project dashboard, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates the database and sets `DATABASE_URL` variable
4. No additional configuration needed

### Step 3: Add API Service

1. Click **"New"** → **"GitHub Repo"**
2. Select your repository again
3. Railway will start deploying. Click on the new service
4. Go to **"Settings"**:

   **Service Name**: Change to `api`

   **Root Directory**: Set to `packages/api`

   **Build Command**:
   ```bash
   npm install && npx prisma generate && npm run build
   ```

   **Start Command**:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

5. Go to **"Variables"** tab and add:
   
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate-strong-random-32-char-string>
   TELEGRAM_BOT_USERNAME=<your-bot-username-from-step-1>
   FRONTEND_URL=https://your-web-url-will-be-set-later
   PORT=3000
   ```

   **Note**: Leave `FRONTEND_URL` as placeholder for now. We'll update it after deploying the web service.

6. Go to **"Settings"** → **"Networking"**:
   - Enable **"Public Networking"**
   - Copy the generated public URL (e.g., `https://api-production-xxxx.up.railway.app`)

7. Click **"Deploy"** to start the deployment

### Step 4: Add Web Service

1. Click **"New"** → **"GitHub Repo"**
2. Select your repository again
3. Railway will start deploying. Click on the new service
4. Go to **"Settings"**:

   **Service Name**: Change to `web`

   **Root Directory**: Set to `packages/web`

   **Build Command**:
   ```bash
   npm install && npm run build
   ```

   **Start Command**:
   ```bash
   npm run preview -- --host 0.0.0.0 --port $PORT
   ```

5. Go to **"Variables"** tab and add:
   
   ```
   VITE_API_URL=<your-api-url-from-step-3>
   VITE_SOCKET_URL=<your-api-url-from-step-3>
   ```

6. Go to **"Settings"** → **"Networking"**:
   - Enable **"Public Networking"**
   - Copy the generated public URL (e.g., `https://web-production-yyyy.up.railway.app`)

7. Click **"Deploy"** to start the deployment

### Step 5: Update API Environment Variables

1. Go back to the **API service**
2. Go to **"Variables"** tab
3. Update `FRONTEND_URL` with the web service URL from Step 4
   ```
   FRONTEND_URL=https://web-production-yyyy.up.railway.app
   ```
4. The API service will automatically redeploy

### Step 6: Configure Telegram Bot Webhook

Now that both services are running, set up the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_API_URL>/verification/webhook"
```

Replace:
- `<YOUR_BOT_TOKEN>` with your bot token from Part 1
- `<YOUR_API_URL>` with your API service URL (e.g., `https://api-production-xxxx.up.railway.app`)

Example:
```bash
curl -X POST "https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook?url=https://api-production-abcd.up.railway.app/verification/webhook"
```

You should see a response like:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## Part 3: Verify Deployment

### Test the API

1. Open your API URL in a browser: `https://api-production-xxxx.up.railway.app`
2. You should see a "Cannot GET /" message (this is normal - it means the API is running)

### Test the Web App

1. Open your web URL in a browser: `https://web-production-yyyy.up.railway.app`
2. You should see the MESG login/register screen

### Test Registration

1. Click on **"Register"** tab
2. Enter:
   - Email: your email
   - Phone: your phone number (e.g., +1234567890)
   - Password: at least 6 characters
3. Click **"Register"**
4. You should be logged in and see the Chats screen

### Test Phone Verification

1. Click on the **"Profile"** tab (person icon)
2. Click **"Verify Phone Number"**
3. Click **"Generate Verification Link"**
4. Click **"Open Telegram"**
5. Your Telegram app should open with a message to start the bot
6. Click **"START"**
7. The bot should verify your phone
8. Go back to the web app - your status should update to "Verified" (may take a few seconds)

## Troubleshooting

### API Service Fails to Start

**Check Logs:**
1. Go to API service in Railway
2. Click on **"Deployments"**
3. Click on the latest deployment
4. Check the logs for errors

**Common Issues:**
- Database connection failed: Check that `DATABASE_URL` variable is set correctly
- Prisma migration failed: Check that database is accessible

**Solution:**
- Redeploy the service
- Check all environment variables are set correctly

### Web Service Shows Blank Page

**Check Browser Console:**
1. Open browser Developer Tools (F12)
2. Check Console tab for errors

**Common Issues:**
- API URL not set: Check `VITE_API_URL` environment variable
- CORS errors: Check that `FRONTEND_URL` is set correctly in API service

**Solution:**
- Verify environment variables
- Redeploy both services

### Telegram Verification Not Working

**Check Webhook:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Common Issues:**
- Webhook not set: The URL in the response should match your API URL
- Wrong bot username: Check `TELEGRAM_BOT_USERNAME` in API variables

**Solution:**
- Re-set the webhook using the command from Step 6
- Check bot username matches exactly (case-sensitive)

### Database Migrations Not Running

**Manually Run Migrations:**

If needed, you can connect to your Railway project via CLI:

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npx prisma migrate deploy --schema=packages/api/prisma/schema.prisma
   ```

## Environment Variables Reference

### API Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection (auto-set by Railway) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Secret for JWT tokens (min 32 chars) | `super-secret-key-min-32-characters-long` |
| `TELEGRAM_BOT_USERNAME` | Yes | Your Telegram bot username | `mesg_verifier_bot` |
| `FRONTEND_URL` | Yes | Web service URL for CORS | `https://web-production-yyyy.up.railway.app` |
| `PORT` | No | Server port (Railway sets automatically) | `3000` |
| `UPLOADS_DIR` | No | Upload directory path | `./uploads` |

### Web Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://api-production-xxxx.up.railway.app` |
| `VITE_SOCKET_URL` | Yes | WebSocket server URL (same as API) | `https://api-production-xxxx.up.railway.app` |

## Updating the Application

### Code Changes

1. Push changes to your GitHub repository
2. Railway will automatically detect changes and redeploy

### Database Schema Changes

1. Create migration locally:
   ```bash
   cd packages/api
   npx prisma migrate dev --name your_migration_name
   ```

2. Commit the migration files:
   ```bash
   git add prisma/migrations
   git commit -m "Add database migration"
   git push
   ```

3. Railway will automatically run migrations on deploy via `prisma migrate deploy` in the start command

## Monitoring

### View Logs

1. Go to your Railway project
2. Click on a service (API or Web)
3. Click **"Deployments"**
4. Click on a deployment to view logs

### View Metrics

1. Go to your Railway project
2. Click on a service
3. Click **"Metrics"** to view:
   - CPU usage
   - Memory usage
   - Network traffic

## Cost Optimization

Railway offers:
- **Free tier**: $5 of usage per month
- **Pro tier**: $20/month + usage

To optimize costs:
1. Use a single database instance for both services
2. Monitor your usage in Railway dashboard
3. Set up usage alerts in Railway settings

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/your-username/mesg/issues

## Security Checklist

- [x] Use strong JWT_SECRET (32+ random characters)
- [x] Set FRONTEND_URL to exact web domain (not wildcard)
- [x] Keep bot token private
- [x] Use environment variables for all secrets
- [x] Never commit .env files to git
- [x] Enable HTTPS (Railway handles this automatically)

## Next Steps

1. **Customize**: Update branding, colors, and UI
2. **Add Features**: Implement additional features as needed
3. **Monitor**: Set up error tracking and monitoring
4. **Scale**: Upgrade Railway plan as your user base grows

Congratulations! Your MESG messenger is now deployed and running on Railway! 🎉
