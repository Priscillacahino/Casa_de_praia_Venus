#!/bin/sh
set -eu
umask 077

if [ "$(id -u)" = "0" ]; then
  # Railway volumes appear only at runtime and are initially owned by root.
  mkdir -p /data/backups
  chown -R node:node /data
  chmod 0700 /data /data/backups
  exec gosu node "$@"
fi

if [ ! -w /data ]; then
  echo "ERROR: /data is not writable by the application user." >&2
  exit 1
fi
mkdir -p /data/backups
exec "$@"
