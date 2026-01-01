# MESG — MVP веб‑мессенджер

Современный веб‑мессенджер, собранный как монорепозиторий для деплоя на Railway. Фронтенд: React + VKUI. Бэкенд: NestJS + PostgreSQL + Prisma. Реалтайм‑сообщения через WebSockets.

## Возможности

- **Аутентификация**: регистрация по email + телефону + паролю
- **Подтверждение телефона**: через Telegram‑бота (без SMS)
- **Поиск пользователей**: по телефону (нормализация в E.164)
- **Контакты**: добавление/просмотр/удаление контактов
- **Личные сообщения**: чат один‑на‑один с обновлениями в реальном времени
- **Текстовые сообщения**
- **Голосовые сообщения**: запись в браузере и отправка
- **Файлы**: загрузка и отправка вложений
- **Реалтайм**: Socket.IO
- **Современный UI**: VKUI

## Технологии

### Бэкенд
- **NestJS** — фреймворк для Node.js
- **PostgreSQL** — база данных
- **Prisma** — ORM
- **JWT** — токены авторизации
- **Socket.IO** — WebSocket‑коммуникации
- **bcrypt** — хэширование паролей
- **libphonenumber-js** — нормализация телефонов в E.164

### Фронтенд
- **React**
- **TypeScript**
- **VKUI** — UI‑kit
- **Vite** — сборка
- **Socket.IO Client**
- **Axios**

## Деплой на Railway

> Проект задуман как **монорепозиторий** и обычно разворачивается **двумя сервисами** в Railway: `api` и `web`, плюс база **PostgreSQL**.

### Требования
- Аккаунт GitHub
- Аккаунт Railway (подключён к GitHub)
- Telegram‑бот (для подтверждения телефона)

### Пошагово

#### 1) Создай Telegram‑бота

1. Открой Telegram и найди [@BotFather](https://t.me/botfather)
2. Отправь `/newbot` и следуй инструкциям
3. Сохрани **token** бота
4. Узнай **username** бота (например, `your_bot`)
5. Вебхук настроим позже на URL вида:
   - `https://<твой-api-домен>.railway.app/verification/webhook`

#### 2) Запушь код в GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/mesg.git
git push -u origin main
```

#### 3) Создай проект в Railway

1. Открой [railway.app](https://railway.app)
2. Нажми **New Project**
3. Выбери **Deploy from GitHub repo**
4. Выбери репозиторий `mesg`

#### 4) Добавь PostgreSQL

1. В проекте Railway нажми **New**
2. Выбери **Database → PostgreSQL**
3. Railway автоматически создаст переменную `DATABASE_URL`

#### 5) Настрой сервис API

1. Нажми **New → GitHub Repo**
2. Выбери этот же репозиторий
3. Настройки сервиса:
   - **Name**: `api`
   - **Root Directory**: `packages/api`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

4. Добавь переменные окружения:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<сгенерируй длинный случайный секрет>
TELEGRAM_BOT_USERNAME=<username_твоего_бота>
FRONTEND_URL=https://<домен-web-сервиса>.railway.app
PORT=3000
```

5. В **Settings → Networking**:
   - включи **Public Networking**
   - сохрани публичный URL сервиса (например, `https://api-production-xxxx.up.railway.app`)

#### 6) Настрой сервис Web

1. Нажми **New → GitHub Repo**
2. Выбери репозиторий снова
3. Настройки сервиса:
   - **Name**: `web`
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

4. Добавь переменные окружения:

```text
VITE_API_URL=https://<твой-api-домен>.railway.app
VITE_SOCKET_URL=https://<твой-api-домен>.railway.app
```

5. В **Settings → Networking**:
   - включи **Public Networking**
   - сохрани публичный URL web‑сервиса

#### 7) Настрой вебхук Telegram

Используй token бота, чтобы выставить webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<твой-api-домен>.railway.app/verification/webhook"
```

#### 8) Обнови FRONTEND_URL

Вернись в переменные окружения API‑сервиса и обнови `FRONTEND_URL` на реальный URL web‑сервиса.

### Справочник переменных окружения

#### API (`packages/api`)

| Переменная | Описание | Пример |
|----------|----------|--------|
| `DATABASE_URL` | строка подключения PostgreSQL | создаётся Railway автоматически |
| `JWT_SECRET` | секрет для JWT | `your-very-secret-key-min-32-chars` |
| `TELEGRAM_BOT_USERNAME` | username Telegram‑бота | `your_bot` |
| `FRONTEND_URL` | URL фронтенда (CORS) | `https://web-production-xxxx.up.railway.app` |
| `PORT` | порт API | `3000` |

#### Web (`packages/web`)

| Переменная | Описание | Пример |
|----------|----------|--------|
| `VITE_API_URL` | URL API | `https://api-production-xxxx.up.railway.app` |
| `VITE_SOCKET_URL` | URL WebSocket сервера | `https://api-production-xxxx.up.railway.app` |

## Локальная разработка

### Требования
- Node.js 18+ и npm
- PostgreSQL
- Telegram‑бот (опционально, если тестируешь подтверждение)

### Запуск

1. Клонируй репозиторий:

```bash
git clone https://github.com/your-username/mesg.git
cd mesg
```

2. Установи зависимости:

```bash
npm install
```

3. Настрой API:

```bash
cd packages/api
cp .env.example .env
# Отредактируй .env (DATABASE_URL и т.д.)
```

4. Прогони миграции:

```bash
cd packages/api
npx prisma migrate dev
```

5. Настрой Web:

```bash
cd packages/web
cp .env.example .env
# При необходимости отредактируй .env
```

6. Запусти dev‑сервера:

```bash
# из корня проекта
npm run dev
```

Будут подняты оба сервиса:
- API: http://localhost:3000
- Web: http://localhost:5173

### Управление базой (Prisma)

```bash
# Сгенерировать Prisma client
cd packages/api
npx prisma generate

# Создать миграцию
cd packages/api
npx prisma migrate dev --name your_migration_name

# Применить миграции в проде
npx prisma migrate deploy

# Prisma Studio (GUI)
cd packages/api
npx prisma studio
```

## Структура проекта

```text
mesg/
├── packages/
│   ├── api/                   # NestJS бэкенд
│   │   ├── prisma/
│   │   │   └── schema.prisma   # схема БД
│   │   ├── src/
│   │   │   ├── auth/           # аутентификация
│   │   │   ├── users/          # пользователи
│   │   │   ├── chats/          # чаты
│   │   │   ├── messages/       # сообщения
│   │   │   ├── contacts/       # контакты
│   │   │   ├── verification/   # подтверждение Telegram
│   │   │   ├── uploads/        # загрузки
│   │   │   ├── websocket/      # WebSocket gateway
│   │   │   └── prisma/         # Prisma service
│   │   └── uploads/            # место хранения загруженных файлов
│   └── web/                    # React фронтенд
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── services/
│           ├── hooks/
│           └── types/
├── package.json
└── README.md
```

## API эндпоинты

### Аутентификация
- `POST /auth/register` — регистрация
- `POST /auth/login` — логин

### Пользователи
- `GET /users/me` — текущий пользователь
- `GET /users/search?phone=<phone>` — поиск по телефону
- `GET /users/:id` — получить пользователя по ID

### Подтверждение
- `POST /verification/generate` — получить Telegram‑ссылку подтверждения
- `POST /verification/webhook` — webhook Telegram‑бота (служебный)

### Контакты
- `POST /contacts` — добавить контакт
- `GET /contacts` — список контактов
- `DELETE /contacts/:id` — удалить контакт

### Чаты
- `POST /chats` — создать/получить чат с пользователем
- `GET /chats` — список чатов
- `GET /chats/:id` — чат по ID

### Сообщения
- `POST /messages` — отправить сообщение
- `GET /messages/chat/:chatId?page=1&limit=50` — сообщения чата (пагинация)

### Загрузки
- `POST /uploads` — загрузить файл (multipart/form-data)
- `GET /uploads/:filename` — получить файл

### WebSocket события

#### Клиент → Сервер
- `send_message` — отправить сообщение
- `join_chat` — вступить в комнату чата
- `leave_chat` — выйти из комнаты

#### Сервер → Клиент
- `new_message` — новое сообщение
- `error` — ошибка

## Примечания по реализации

### Нормализация телефонов
Все номера приводятся к E.164 через `libphonenumber-js`:
- пример: `(555) 123-4567` → `+15551234567`

### Хэширование пароля
Пароли хэшируются bcrypt (10 раундов).

### JWT
Токены действуют 30 дней. Заголовок запросов:

```text
Authorization: Bearer <token>
```

### Хранение файлов
Файлы сохраняются локально в `./uploads` и раздаются статикой по `/uploads/:filename`.

### Голосовые
Запись в браузере через MediaRecorder, формат обычно WebM, далее отправка как файл.

## Безопасность (минимум)
- используй сильный `JWT_SECRET` в проде
- не коммить `.env`
- `uploads` добавлен в `.gitignore`
- CORS ограничен `FRONTEND_URL`

## Troubleshooting

### Проблемы с подключением к БД
- проверь `DATABASE_URL`
- убедись, что PostgreSQL запущен/доступен

### WebSocket не подключается
- проверь `VITE_SOCKET_URL`
- проверь CORS/Networking в Railway

### Telegram‑подтверждение не работает
- проверь правильность webhook
- проверь `TELEGRAM_BOT_USERNAME`
- проверь token бота

### Не грузятся файлы
- убедись, что папка `uploads` существует и доступна на запись
- проверь лимит размера (по умолчанию 10MB)

## Лицензия

MIT

## Поддержка

Если есть вопросы — создай issue в репозитории.
