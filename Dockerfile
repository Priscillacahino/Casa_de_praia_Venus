FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/data/venus.sqlite \
    GUIDE_CACHE_PATH=/data/guia-venus-pb.html

# Runtime: root only for ownership adjustment on Railway volume; Node runs unprivileged.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node package.json ./
COPY --chown=node:node server/ ./server/
COPY --chown=node:node scripts/ ./scripts/
COPY --chown=node:node public/ ./public/
COPY --chown=node:node docs/termo-compromisso-minuta.txt ./docs/termo-compromisso-minuta.txt
COPY deploy/start-venus.sh /usr/local/bin/start-venus

# scripts/backup.js writes ./backups; the symlink puts encrypted backups on the volume.
RUN mkdir -p /data \
    && ln -s /data/backups /app/backups \
    && chmod 0755 /usr/local/bin/start-venus

USER root
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/start-venus"]
CMD ["node", "server/index.js"]
