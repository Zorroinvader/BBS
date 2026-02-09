# Use Debian-based image so better-sqlite3 native addon works (Alpine/musl causes fcntl64 symbol errors)
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

VOLUME ["/app/uploads", "/app/data"]

CMD ["node", "src/index.js"]
