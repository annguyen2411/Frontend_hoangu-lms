FROM node:20-alpine

WORKDIR /app

COPY src/server/package*.json ./

RUN npm ci --only=production

COPY src/server/ ./src
COPY src/server/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
