# Giai đoạn 1: build React bằng Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY vite.config.js index.html ./
COPY src ./src
COPY public ./public
RUN npm run build

# Giai đoạn 2: chỉ mang theo bản build và server Node
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY server ./server
COPY --from=build /app/dist ./dist

EXPOSE 3101
CMD ["node", "server/index.js"]
