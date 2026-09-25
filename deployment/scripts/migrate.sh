#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deployment/compose/docker-compose.prod.yml"
ENV_FILE="${ROOT_DIR}/deployment/env/.env.prod"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy deployment/env/.env.prod.example first." >&2
  exit 1
fi

SKIP_BUILD=false
WITH_ADMIN=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --with-admin)
      WITH_ADMIN=true
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--skip-build] [--with-admin]" >&2
      exit 1
      ;;
  esac
done

compose() {
  if [[ "${WITH_ADMIN}" == "true" ]]; then
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" --profile admin "$@"
    return
  fi
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

wait_for_postgres() {
  local attempts=0
  local max_attempts=60

  until compose exec -T postgres sh -lc \
    'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1'; do
    attempts=$((attempts + 1))
    if (( attempts >= max_attempts )); then
      echo "Postgres is not ready after ${max_attempts} attempts." >&2
      return 1
    fi
    sleep 2
  done
}

wait_for_directus_metadata() {
  local attempts=0
  local max_attempts=90

  until compose exec -T postgres sh -lc \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT (to_regclass('\''public.directus_collections'\'') IS NOT NULL AND to_regclass('\''public.directus_fields'\'') IS NOT NULL)::int" | grep -qx 1'; do
    attempts=$((attempts + 1))
    if (( attempts >= max_attempts )); then
      echo "Directus metadata tables were not created after ${max_attempts} attempts." >&2
      compose logs --tail=120 directus postgres || true
      return 1
    fi
    sleep 2
  done
}

if [[ "${SKIP_BUILD}" != "true" ]]; then
  compose build api-1
fi

compose up -d postgres
wait_for_postgres

if [[ "${WITH_ADMIN}" == "true" ]]; then
  compose up -d directus
  wait_for_directus_metadata
fi

compose run --rm --no-deps api-1 bun dist/migrate.js
