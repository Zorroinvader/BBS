FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

VOLUME ["/app/uploads", "/app/data"]

CMD ["node", "src/index.js"]
