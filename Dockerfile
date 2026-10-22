FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/data/venus.sqlite
COPY --chown=node:node package.json ./
COPY --chown=node:node server/ ./server/
COPY --chown=node:node scripts/ ./scripts/
COPY --chown=node:node public/ ./public/
COPY --chown=node:node docs/termo-compromisso-minuta.txt ./docs/termo-compromisso-minuta.txt
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3001
CMD ["node", "server/index.js"]