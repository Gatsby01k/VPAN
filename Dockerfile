FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json server.mjs ./
RUN mkdir -p data && chown -R node:node /app
USER node
ENV PORT=3000 HOST=0.0.0.0 DB_PATH=/app/data/partners.sqlite
EXPOSE 3000
CMD ["node", "server.mjs"]
