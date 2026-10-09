FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json server.mjs ./
COPY public ./public
RUN mkdir -p data && chown -R node:node /app
USER node
ENV PORT=3000 HOST=0.0.0.0 DB_PATH=/app/data/partners.sqlite
EXPOSE 3000
CMD ["node","server.mjs"]