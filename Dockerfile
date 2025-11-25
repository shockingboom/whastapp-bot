FROM node:20-alpine AS builder

RUN apk add --no-cache \
    python3 \
    make \
    g++

WORKDIR /app

COPY ./skincare-whatsapp-client/package*.json ./

RUN npm install && \
    npm cache clean --force

COPY ./skincare-whatsapp-client ./

ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"


RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    wqy-zenhei \
    tini \
    dumb-init

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY ./skincare-whatsapp-client/package*.json ./

RUN npm install --production && \
    npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
# Prisma removed: no prisma files copied or generated.

RUN mkdir -p /app/logs /app/.wwebjs_auth /app/.wwebjs_cache && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5555

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5555/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
