#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deployment/compose/docker-compose.prod.yml"
ENV_FILE="${ROOT_DIR}/deployment/env/.env.prod"
BACKUP_DIR="${ROOT_DIR}/deployment/backups"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy deployment/env/.env.prod.example first." >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="${BACKUP_DIR}/postgres_${TIMESTAMP}.dump"
TMP_FILE="${OUT_FILE}.tmp"

docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  exec -T postgres \
  sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "${TMP_FILE}"

mv "${TMP_FILE}" "${OUT_FILE}"
chmod 600 "${OUT_FILE}"
echo "Backup written to ${OUT_FILE}"
