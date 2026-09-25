#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deployment/compose/docker-compose.prod.yml"
ENV_FILE="${ROOT_DIR}/deployment/env/.env.prod"
SSL_CERT="${ROOT_DIR}/deployment/nginx/ssl/origin.crt"
SSL_KEY="${ROOT_DIR}/deployment/nginx/ssl/origin.key"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy deployment/env/.env.prod.example first." >&2
  exit 1
fi
if [[ ! -f "${SSL_CERT}" || ! -f "${SSL_KEY}" ]]; then
  echo "Missing Cloudflare origin cert/key under deployment/nginx/ssl/." >&2
  exit 1
fi

WORKER_FLAGS=()
OBS_FLAGS=()
ADMIN_FLAGS=()
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-workers)
      WORKER_FLAGS=(--profile workers)
      shift
      ;;
    --with-observability)
      OBS_FLAGS=(--profile observability)
      shift
      ;;
    --with-admin)
      ADMIN_FLAGS=(--profile admin)
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--with-workers] [--with-observability] [--with-admin] [--skip-build]" >&2
      exit 1
      ;;
  esac
done

RUNNER_ENABLED_RAW="$(grep -E '^WORD_INSIGHT_JOB_RUNNER_ENABLED=' "${ENV_FILE}" | tail -n 1 | cut -d= -f2- || true)"
RUNNER_ENABLED="$(echo "${RUNNER_ENABLED_RAW}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]"'\''')"

if (( ${#WORKER_FLAGS[@]} > 0 )); then
  if [[ "${RUNNER_ENABLED}" != "false" ]]; then
    echo "Invalid config: --with-workers requires WORD_INSIGHT_JOB_RUNNER_ENABLED=false in ${ENV_FILE}." >&2
    exit 1
  fi
else
  if [[ "${RUNNER_ENABLED}" == "false" ]]; then
    echo "Warning: --with-workers is not enabled and WORD_INSIGHT_JOB_RUNNER_ENABLED=false; word insight jobs will remain queued." >&2
  fi
fi

if [[ "${SKIP_BUILD}" != "true" ]]; then
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build
fi

# --profile is a global docker compose flag and must be passed before subcommand.
docker compose \
  --env-file "${ENV_FILE}" \
  -f "${COMPOSE_FILE}" \
  "${WORKER_FLAGS[@]}" \
  "${OBS_FLAGS[@]}" \
  "${ADMIN_FLAGS[@]}" \
  up -d

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps
