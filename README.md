# MESG - MVP Web Messenger

A modern web messenger built as a monorepo for deployment on Railway. Features React + VKUI frontend, NestJS backend with PostgreSQL, and real-time messaging via WebSockets.

## Features

- 🔐 **Authentication**: Email, phone, and password-based registration
- 📱 **Phone Verification**: Via Telegram bot (no SMS required)
- 🔍 **User Search**: Search by normalized E.164 phone number
- 👥 **Contacts**: Add, list, and manage contacts
- 💬 **Direct Messaging**: One-on-one chats with real-time updates
- 📝 **Text Messages**: Send and receive text messages
- 🎤 **Voice Messages**: Record and send voice messages via browser
- 📎 **File Attachments**: Upload and share files
- ⚡ **Real-time**: WebSocket-based live messaging
- 🎨 **Modern UI**: Built with VKUI components

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM
- **JWT** - Authentication tokens
- **Socket.IO** - Real-time WebSocket communication
- **bcrypt** - Password hashing
- **libphonenumber-js** - Phone number normalization to E.164

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **VKUI** - VK's UI kit for modern interfaces
- **Vite** - Fast build tool
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client

## Deployment on Railway

### Prerequisites
- GitHub account
- Railway account (connect it to your GitHub)
- Telegram bot (for phone verification)

### Step-by-Step Deployment

#### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Save your bot token
4. Get your bot username (e.g., `your_bot`)
5. Set webhook URL later: `https://your-api-domain.railway.app/verification/webhook`

#### 2. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/mesg.git
git push -u origin main
```

#### 3. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your `mesg` repository

#### 4. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable

#### 5. Configure API Service

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Name**: `api`
   - **Root Directory**: `packages/api`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

4. Add environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate-a-random-secret-key>
   TELEGRAM_BOT_USERNAME=<your-bot-username>
   FRONTEND_URL=https://your-web-domain.railway.app
   PORT=3000
   ```

5. Under Settings → Networking:
   - Enable "Public Networking"
   - Note the public URL (e.g., `https://api-production-xxxx.up.railway.app`)

#### 6. Configure Web Service

1. Click "New" → "GitHub Repo"
2. Select your repository again
3. Configure the service:
   - **Name**: `web`
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

4. Add environment variables:
   ```
   VITE_API_URL=https://your-api-domain.railway.app
   VITE_SOCKET_URL=https://your-api-domain.railway.app
   ```

5. Under Settings → Networking:
   - Enable "Public Networking"
   - Note the public URL

#### 7. Configure Telegram Bot Webhook

Use your Telegram bot token to set the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-api-domain.railway.app/verification/webhook"
```

#### 8. Update Environment Variables

Go back to the API service and update `FRONTEND_URL` with your actual web service URL.

### Environment Variables Reference

#### API Service (`packages/api`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Automatically set by Railway |
| `JWT_SECRET` | Secret key for JWT tokens | `your-very-secret-key-min-32-chars` |
| `TELEGRAM_BOT_USERNAME` | Your Telegram bot username | `your_bot` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://web-production-xxxx.up.railway.app` |
| `PORT` | Server port | `3000` |

#### Web Service (`packages/web`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api-production-xxxx.up.railway.app` |
| `VITE_SOCKET_URL` | WebSocket server URL | `https://api-production-xxxx.up.railway.app` |

## Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Telegram bot (optional, for testing verification)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mesg.git
   cd mesg
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the API:
   ```bash
   cd packages/api
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run database migrations:
   ```bash
   cd packages/api
   npx prisma migrate dev
   ```

5. Set up the web frontend:
   ```bash
   cd packages/web
   cp .env.example .env
   # Edit .env if needed
   ```

6. Start development servers:
   ```bash
   # From project root
   npm run dev
   ```

   This starts both services:
   - API: http://localhost:3000
   - Web: http://localhost:5173

### Database Management

```bash
# Generate Prisma client
cd packages/api
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Project Structure

```
mesg/
├── packages/
│   ├── api/                 # NestJS backend
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── users/       # Users module
│   │   │   ├── chats/       # Chats module
│   │   │   ├── messages/    # Messages module
│   │   │   ├── contacts/    # Contacts module
│   │   │   ├── verification/ # Telegram verification
│   │   │   ├── uploads/     # File uploads
│   │   │   ├── websocket/   # WebSocket gateway
│   │   │   └── prisma/      # Prisma service
│   │   └── uploads/         # Uploaded files storage
│   └── web/                 # React frontend
│       └── src/
│           ├── components/  # Reusable components
│           ├── pages/       # Page components
│           ├── services/    # API & WebSocket services
│           ├── hooks/       # React hooks
│           └── types/       # TypeScript types
├── package.json             # Root package.json
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/me` - Get current user
- `GET /users/search?phone=<phone>` - Search user by phone
- `GET /users/:id` - Get user by ID

### Verification
- `POST /verification/generate` - Generate Telegram verification link
- `POST /verification/webhook` - Telegram bot webhook (internal)

### Contacts
- `POST /contacts` - Add contact
- `GET /contacts` - List contacts
- `DELETE /contacts/:id` - Remove contact

### Chats
- `POST /chats` - Create/get chat with user
- `GET /chats` - List user's chats
- `GET /chats/:id` - Get chat by ID

### Messages
- `POST /messages` - Send message
- `GET /messages/chat/:chatId?page=1&limit=50` - Get chat messages (paginated)

### Uploads
- `POST /uploads` - Upload file (multipart/form-data)
- `GET /uploads/:filename` - Serve uploaded file

### WebSocket Events

#### Client → Server
- `send_message` - Send a message
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room

#### Server → Client
- `new_message` - New message received
- `error` - Error occurred

## Features Implementation

### Phone Normalization
All phone numbers are normalized to E.164 format using `libphonenumber-js`:
- Example: `(555) 123-4567` → `+15551234567`

### Password Hashing
Passwords are hashed using bcrypt with 10 rounds.

### JWT Authentication
JWT tokens are valid for 30 days. Include in requests:
```
Authorization: Bearer <token>
```

### File Storage
Files are stored locally in `./uploads` directory and served statically at `/uploads/:filename`.

### Voice Messages
Recorded in the browser using MediaRecorder API, saved as WebM audio format, and uploaded as files.

## Security Notes

- Always use strong JWT secrets in production
- Keep `.env` files out of version control
- The `uploads` directory is in `.gitignore`
- CORS is configured for your frontend URL
- All API endpoints (except auth) require JWT authentication

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly set
- Check PostgreSQL is running (local) or accessible (Railway)

### WebSocket Connection Failed
- Verify `VITE_SOCKET_URL` matches your API URL
- Check CORS settings in `main.ts`

### Telegram Verification Not Working
- Confirm webhook is set correctly
- Check `TELEGRAM_BOT_USERNAME` is correct
- Verify bot token is valid

### File Uploads Failing
- Ensure `uploads` directory exists and is writable
- Check file size limits (default 10MB)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
