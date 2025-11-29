# WhatsApp Bot

Simple WhatsApp bot backend using whatsapp-web.js and Express.

Overview

- TypeScript Express server that initializes a WhatsApp client via whatsapp-web.js (LocalAuth).
- Exposes a small HTTP API to send messages through the connected WhatsApp session.

Key features

- Send messages programmatically via HTTP POST /api/send-message
- QR code generation at first run (printed to console)
- Auto-reconnect and presence pings to keep session alive

Requirements

- Node.js 18+ (recommended)
- npm or yarn

Quick start

1. Install dependencies

```pwsh
npm install
```

2. Create a .env (optional)

Example .env

```ini
PORT=5555
X_API_KEY=your-api-key
```

3. Run in development

```pwsh
npm run dev
```

Build & run production

```pwsh
npm run build
npm start
```

Project structure (important files)

- `src/index.ts` - bootstrap and graceful shutdown
- `src/app.ts` - Express app wrapper
- `src/routes/message.routes.ts` - API route for sending messages
- `src/controllers/message.controller.ts` - controller with validation and error mapping
- `src/services/whatsapp.service.ts` - whatsapp-web.js client wrapper
- `src/config/app.config.ts` - configuration and env defaults
- `src/utils/phone.util.ts` - phone formatting/validation

Environment and behavior notes

- By default the WhatsApp client runs headless and uses `LocalAuth` to persist session data to disk.
- The service periodically pings `config.serverUrl` if set to keep some hosts alive.

Contributing

- Keep TypeScript types in `src/types` in sync with controller/service signatures.
- Add unit tests and update README when adding endpoints.

Troubleshooting

- If QR code doesn't show, ensure your terminal supports ANSI and run with a non-headless browser by adjusting `config.whatsapp.puppeteerOptions.headless` in `src/config/app.config.ts`.
- If messages fail with `WhatsApp client is not ready`, wait until the console logs `WhatsApp client is ready!` before calling the API.

See `docs/DETAILED_API.md` for API details.
