# Quick Start Guide

Get MESG messenger running locally in minutes!

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 1. Clone and Install

```bash
git clone https://github.com/your-username/mesg.git
cd mesg
npm install
```

## 2. Setup Database

### Option A: Local PostgreSQL

```bash
# Create database
createdb mesg

# Or use psql
psql -U postgres
CREATE DATABASE mesg;
\q
```

### Option B: Docker PostgreSQL

```bash
docker run --name mesg-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mesg \
  -p 5432:5432 \
  -d postgres:15
```

## 3. Configure API

```bash
cd packages/api
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mesg?schema=public"
JWT_SECRET="your-secret-key-at-least-32-chars-long"
TELEGRAM_BOT_USERNAME="your_bot"  # Optional for local dev
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

## 4. Run Migrations

```bash
# Still in packages/api directory
npx prisma migrate dev
npx prisma generate
```

**Note:** The initial migration (`0001_init`) is already committed to the repository. This command will apply it to your local database and generate the Prisma Client.

## 5. Configure Web

```bash
cd ../web
cp .env.example .env
```

The default values in `.env` should work:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 6. Start Development

Open **two terminal windows**:

**Terminal 1 - API:**
```bash
cd packages/api
npm run dev
```

**Terminal 2 - Web:**
```bash
cd packages/web
npm run dev
```

Or from the root directory:
```bash
npm run dev
```

## 7. Open the App

Open your browser and go to: **http://localhost:5173**

## 8. Create an Account

1. Click **Register** tab
2. Enter:
   - Email: `test@example.com`
   - Phone: `+1234567890`
   - Password: `password123`
3. Click **Register**

You're now logged in! 🎉

## Testing Features

### Search for Users

1. Register a second user (use different email/phone)
2. Log in with first user
3. Click **Search** tab
4. Enter the second user's phone number
5. Click **Chat** to start messaging

### Send Messages

1. Open a chat
2. Type a message and press Enter or click send icon
3. Messages appear in real-time!

### Upload Files

1. In a chat, click the attachment icon (📎)
2. Select a file (max 10MB)
3. File is uploaded and appears in chat

### Voice Messages

1. In a chat, click and hold the microphone icon (🎤)
2. Speak your message
3. Release to send
4. Voice message appears in chat

## Telegram Verification (Optional)

To test phone verification:

1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Update `TELEGRAM_BOT_USERNAME` in `packages/api/.env`
3. Set webhook (replace with your bot token):
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=http://localhost:3000/verification/webhook"
   ```
4. In the app, go to Profile → Verify Phone Number
5. Click Generate Link and Open Telegram
6. Start the bot in Telegram

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Error

- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Try: `psql -U postgres -d mesg` to test connection

### Prisma Client Not Generated

```bash
cd packages/api
npx prisma generate
```

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway deployment
- Check out the [API documentation](README.md#api-endpoints)

## Development Tips

### Database GUI

View and edit database with Prisma Studio:
```bash
cd packages/api
npx prisma studio
```

Opens at: http://localhost:5555

### Hot Reload

Both API and Web support hot reload. Changes auto-refresh!

### Reset Database

```bash
cd packages/api
npx prisma migrate reset
```

⚠️ This will delete all data!

### View Logs

API logs appear in Terminal 1, Web logs in Terminal 2.

## Production Build

Test production builds locally:

```bash
# Build everything
npm run build

# Start API
cd packages/api
npm run start:prod

# Start Web (in another terminal)
cd packages/web
npm run preview
```

---

Happy coding! 🚀
