FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
FROM node:24-bookworm-slim
ENV NODE_ENV=production PORT=3001 DATABASE_PATH=/app/data/venus.sqlite
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/docs ./docs
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./package.json
RUN mkdir -p data backups && chown -R node:node /app/data /app/backups
USER node
EXPOSE 3001
VOLUME ["/app/data", "/app/backups"]
CMD ["node", "server/index.js"]
