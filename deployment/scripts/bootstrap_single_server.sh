#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

APP_DIR="${LOCAL_REPO_ROOT}"
REPO_URL=""
REPO_BRANCH=""
DEPLOY_USER="deploy"
AUTHORIZED_KEYS_SOURCE=""
ENV_SOURCE=""
ORIGIN_CERT_SOURCE=""
ORIGIN_KEY_SOURCE=""
ADMIN_SSH_CIDR=""
CORS_ORIGIN_OVERRIDE=""
OPENAI_API_KEY_OVERRIDE=""
DEEPSEEK_API_KEY_OVERRIDE=""
DEEPSEEK_TIMEOUT_MS_OVERRIDE=""
FIREBASE_PROJECT_ID_OVERRIDE=""
FIREBASE_CLIENT_EMAIL_OVERRIDE=""
FIREBASE_PRIVATE_KEY_OVERRIDE=""
FIREBASE_SERVICE_ACCOUNT_JSON_FILE=""

WITH_WORKERS=true
WITH_OBSERVABILITY=false
WITH_ADMIN=false
APPLY_FIREWALL=false
ALLOW_HTTP=false
HARDEN_SSH=false
SKIP_OS_UPGRADE=false
SKIP_PULL=false
SKIP_MIGRATE=false
SKIP_DEPLOY=false
RESET_DATA_VOLUMES=false
RECREATE_ENV=false

log() {
  echo "[bootstrap] $*"
}

warn() {
  echo "[bootstrap][warn] $*" >&2
}

die() {
  echo "[bootstrap][error] $*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage:
  sudo ./deployment/scripts/bootstrap_single_server.sh [options]

Core options:
  --repo-url <git_url>                 Clone/update source repo at --app-dir.
  --repo-branch <branch>               Optional git branch for clone/pull.
  --app-dir <path>                     Target path (default: repo where script exists).
  --deploy-user <user>                 Linux user to create/use (default: deploy).
  --authorized-keys-source <path>      Public key file copied to deploy user.
  --env-source <path>                  Source .env.prod to copy.
  --recreate-env                       Recreate .env.prod from .env.prod.example before applying overrides.
  --origin-cert <path>                 Cloudflare Origin certificate file.
  --origin-key <path>                  Cloudflare Origin key file.

Security / networking:
  --harden-ssh                         Apply basic sshd hardening from README.
  --apply-firewall                     Configure UFW (Cloudflare-only HTTPS).
  --admin-ssh-cidr <cidr>              Required with --apply-firewall (example 1.2.3.4/32).
  --allow-http                         Open port 80 for Cloudflare too (optional redirect).

App/env overrides:
  --cors-origin <csv>                  Set CORS_ORIGIN.
  --openai-api-key <key>               Set OPENAI_API_KEY and provider=openai.
  --deepseek-api-key <key>             Set DEEPSEEK_API_KEY and provider=deepseek.
  --deepseek-timeout-ms <ms>           Set DEEPSEEK_TIMEOUT_MS.
  --firebase-project-id <id>           Set FIREBASE_PROJECT_ID.
  --firebase-client-email <email>      Set FIREBASE_CLIENT_EMAIL.
  --firebase-private-key <key>         Set FIREBASE_PRIVATE_KEY (\n escaped).
  --firebase-service-account-json <p>  File path (raw or base64 json) for FIREBASE_SERVICE_ACCOUNT_JSON.

Deploy toggles:
  --no-workers                         Do not pass --with-workers to deploy.
  --with-observability                 Deploy observability profile.
  --with-admin                         Deploy private admin profile (Directus).
  --reset-data-volumes                 Run 'docker compose down -v' before migrate/deploy (destructive).
  --skip-os-upgrade                    Skip apt upgrade (still installs required packages).
  --skip-pull                          Skip git fetch/pull when repo already exists.
  --skip-migrate                       Skip migration step.
  --skip-deploy                        Skip deploy step.
  -h, --help                           Show this help.

Examples:
  sudo ./deployment/scripts/bootstrap_single_server.sh \
    --repo-url git@github.com:ORG/REPO.git \
    --app-dir /opt/vocorbit-server \
    --origin-cert /root/origin.crt \
    --origin-key /root/origin.key \
    --deepseek-api-key sk-xxxx \
    --deepseek-timeout-ms 45000 \
    --firebase-project-id my-project \
    --cors-origin https://api.example.com,https://app.example.com
EOF
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "Run as root (sudo)."
  fi
}

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    die "Missing required command: ${cmd}"
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo-url)
        REPO_URL="${2:-}"
        shift 2
        ;;
      --repo-branch)
        REPO_BRANCH="${2:-}"
        shift 2
        ;;
      --app-dir)
        APP_DIR="${2:-}"
        shift 2
        ;;
      --deploy-user)
        DEPLOY_USER="${2:-}"
        shift 2
        ;;
      --authorized-keys-source)
        AUTHORIZED_KEYS_SOURCE="${2:-}"
        shift 2
        ;;
      --env-source)
        ENV_SOURCE="${2:-}"
        shift 2
        ;;
      --recreate-env)
        RECREATE_ENV=true
        shift
        ;;
      --origin-cert)
        ORIGIN_CERT_SOURCE="${2:-}"
        shift 2
        ;;
      --origin-key)
        ORIGIN_KEY_SOURCE="${2:-}"
        shift 2
        ;;
      --admin-ssh-cidr)
        ADMIN_SSH_CIDR="${2:-}"
        shift 2
        ;;
      --cors-origin)
        CORS_ORIGIN_OVERRIDE="${2:-}"
        shift 2
        ;;
      --openai-api-key)
        OPENAI_API_KEY_OVERRIDE="${2:-}"
        shift 2
        ;;
      --deepseek-api-key)
        DEEPSEEK_API_KEY_OVERRIDE="${2:-}"
        shift 2
        ;;
      --deepseek-timeout-ms)
        DEEPSEEK_TIMEOUT_MS_OVERRIDE="${2:-}"
        shift 2
        ;;
      --firebase-project-id)
        FIREBASE_PROJECT_ID_OVERRIDE="${2:-}"
        shift 2
        ;;
      --firebase-client-email)
        FIREBASE_CLIENT_EMAIL_OVERRIDE="${2:-}"
        shift 2
        ;;
      --firebase-private-key)
        FIREBASE_PRIVATE_KEY_OVERRIDE="${2:-}"
        shift 2
        ;;
      --firebase-service-account-json)
        FIREBASE_SERVICE_ACCOUNT_JSON_FILE="${2:-}"
        shift 2
        ;;
      --harden-ssh)
        HARDEN_SSH=true
        shift
        ;;
      --apply-firewall)
        APPLY_FIREWALL=true
        shift
        ;;
      --allow-http)
        ALLOW_HTTP=true
        shift
        ;;
      --no-workers)
        WITH_WORKERS=false
        shift
        ;;
      --with-observability)
        WITH_OBSERVABILITY=true
        shift
        ;;
      --with-admin)
        WITH_ADMIN=true
        shift
        ;;
      --reset-data-volumes)
        RESET_DATA_VOLUMES=true
        shift
        ;;
      --skip-os-upgrade)
        SKIP_OS_UPGRADE=true
        shift
        ;;
      --skip-pull)
        SKIP_PULL=true
        shift
        ;;
      --skip-migrate)
        SKIP_MIGRATE=true
        shift
        ;;
      --skip-deploy)
        SKIP_DEPLOY=true
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "Unknown option: $1"
        ;;
    esac
  done
}

set_sshd_option() {
  local file="$1"
  local key="$2"
  local value="$3"

  if grep -qE "^[#[:space:]]*${key}[[:space:]]+" "${file}"; then
    sed -i -E "s|^[#[:space:]]*${key}[[:space:]]+.*|${key} ${value}|g" "${file}"
  else
    printf "%s %s\n" "${key}" "${value}" >> "${file}"
  fi
}

install_base_packages() {
  log "Installing base packages"
  apt-get update
  if [[ "${SKIP_OS_UPGRADE}" != "true" ]]; then
    DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
  fi
  DEBIAN_FRONTEND=noninteractive apt-get -y install \
    ca-certificates curl gnupg ufw fail2ban git

  systemctl enable --now fail2ban
}

ensure_deploy_user() {
  if id "${DEPLOY_USER}" >/dev/null 2>&1; then
    log "User ${DEPLOY_USER} already exists"
  else
    log "Creating user ${DEPLOY_USER}"
    adduser --disabled-password --gecos "" "${DEPLOY_USER}"
  fi

  usermod -aG sudo "${DEPLOY_USER}"

  local keys_source="${AUTHORIZED_KEYS_SOURCE}"
  if [[ -z "${keys_source}" && -f /root/.ssh/authorized_keys ]]; then
    keys_source="/root/.ssh/authorized_keys"
  fi

  if [[ -n "${keys_source}" ]]; then
    [[ -f "${keys_source}" ]] || die "Authorized keys source not found: ${keys_source}"

    install -d -m 700 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
    install -m 600 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" \
      "${keys_source}" "/home/${DEPLOY_USER}/.ssh/authorized_keys"
  else
    warn "No authorized keys source provided; skipped SSH key copy for ${DEPLOY_USER}"
  fi
}

harden_sshd_if_requested() {
  if [[ "${HARDEN_SSH}" != "true" ]]; then
    return
  fi

  local sshd_conf="/etc/ssh/sshd_config"
  [[ -f "${sshd_conf}" ]] || die "sshd config not found at ${sshd_conf}"
  cp "${sshd_conf}" "${sshd_conf}.bak.$(date +%s)"

  log "Applying SSH hardening"
  set_sshd_option "${sshd_conf}" "PermitRootLogin" "no"
  set_sshd_option "${sshd_conf}" "PasswordAuthentication" "no"
  set_sshd_option "${sshd_conf}" "PubkeyAuthentication" "yes"
  set_sshd_option "${sshd_conf}" "MaxAuthTries" "3"

  require_cmd sshd
  sshd -t
  if systemctl list-unit-files | grep -q '^ssh\.service'; then
    systemctl restart ssh
  else
    systemctl restart sshd
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker already installed"
  else
    log "Installing Docker"
    curl -fsSL https://get.docker.com | sh
  fi

  systemctl enable --now docker
  usermod -aG docker "${DEPLOY_USER}"
}

ensure_repo() {
  if [[ -d "${APP_DIR}/.git" ]]; then
    log "Repository exists at ${APP_DIR}"
    if [[ "${SKIP_PULL}" == "true" ]]; then
      return
    fi

    log "Updating repository"
    git -C "${APP_DIR}" fetch --all --prune

    if [[ -n "${REPO_BRANCH}" ]]; then
      git -C "${APP_DIR}" checkout "${REPO_BRANCH}"
      git -C "${APP_DIR}" pull --ff-only origin "${REPO_BRANCH}"
    else
      git -C "${APP_DIR}" pull --ff-only
    fi
    return
  fi

  [[ -n "${REPO_URL}" ]] || die "Missing repo at ${APP_DIR}. Provide --repo-url to clone."

  log "Cloning repository into ${APP_DIR}"
  install -d "$(dirname "${APP_DIR}")"
  if [[ -n "${REPO_BRANCH}" ]]; then
    git clone --branch "${REPO_BRANCH}" "${REPO_URL}" "${APP_DIR}"
  else
    git clone "${REPO_URL}" "${APP_DIR}"
  fi
}

env_get() {
  local key="$1"
  local file="$2"
  local line
  line="$(grep -E "^${key}=" "${file}" | tail -n1 || true)"
  printf "%s" "${line#*=}" | tr -d '\r\n'
}

env_set() {
  local key="$1"
  local value="$2"
  local file="$3"
  # Keep .env single-line semantics and avoid sed replacement edge-cases
  # with secrets that may contain special characters.
  value="${value//$'\r'/}"
  value="${value//$'\n'/\\n}"

  local tmp_file
  tmp_file="$(mktemp)"
  awk -v k="${key}" -v v="${value}" '
    BEGIN { replaced = 0 }
    index($0, k "=") == 1 {
      if (!replaced) {
        print k "=" v
        replaced = 1
      }
      next
    }
    { print }
    END {
      if (!replaced) {
        print k "=" v
      }
    }
  ' "${file}" > "${tmp_file}"
  mv "${tmp_file}" "${file}"
}

env_set_if_empty() {
  local key="$1"
  local value="$2"
  local file="$3"
  local current
  current="$(env_get "${key}" "${file}")"
  if [[ -z "${current}" ]]; then
    env_set "${key}" "${value}" "${file}"
  fi
}

random_hex() {
  local bytes="$1"
  require_cmd openssl
  openssl rand -hex "${bytes}"
}

set_placeholder_secret_if_needed() {
  local key="$1"
  local bytes="$2"
  local file="$3"
  local current
  current="$(env_get "${key}" "${file}")"

  if [[ -z "${current}" || "${current}" == change_this_* ]]; then
    env_set "${key}" "$(random_hex "${bytes}")" "${file}"
  fi
}

prepare_env() {
  local env_file="${APP_DIR}/deployment/env/.env.prod"
  local env_example="${APP_DIR}/deployment/env/.env.prod.example"

  [[ -f "${env_example}" ]] || die "Missing env example: ${env_example}"

  if [[ -n "${ENV_SOURCE}" ]]; then
    [[ -f "${ENV_SOURCE}" ]] || die "Env source not found: ${ENV_SOURCE}"
    cp "${ENV_SOURCE}" "${env_file}"
  elif [[ "${RECREATE_ENV}" == "true" ]]; then
    cp "${env_example}" "${env_file}"
  elif [[ ! -f "${env_file}" ]]; then
    cp "${env_example}" "${env_file}"
  fi

  env_set_if_empty "WORD_INSIGHT_JOB_RUNNER_ENABLED" "false" "${env_file}"
  env_set_if_empty "POSTGRES_BIND_PORT" "55432" "${env_file}"
  env_set_if_empty "DIRECTUS_BIND_PORT" "8055" "${env_file}"
  env_set_if_empty "DIRECTUS_PUBLIC_URL" "http://localhost:8055" "${env_file}"
  env_set_if_empty "DIRECTUS_ADMIN_EMAIL" "admin@example.com" "${env_file}"
  env_set_if_empty "APP_REGION" "eu" "${env_file}"
  env_set_if_empty "HOME_REGION_DEFAULT" "eu" "${env_file}"
  env_set_if_empty "REGION_SHARD_COUNT" "16" "${env_file}"
  # Single-server bootstrap keeps auth/billing local (no core proxy hop).
  env_set "AUTH_BILLING_CORE_BASE_URL" "" "${env_file}"
  env_set_if_empty "AUTH_BILLING_PROXY_TIMEOUT_MS" "10000" "${env_file}"
  env_set_if_empty "POSTGRES_MEM_LIMIT" "1024m" "${env_file}"
  env_set_if_empty "REDIS_MEM_LIMIT" "256m" "${env_file}"
  env_set_if_empty "API_MEM_LIMIT" "512m" "${env_file}"
  env_set_if_empty "WORD_INSIGHT_JOB_CONCURRENCY" "1" "${env_file}"
  env_set_if_empty "BILLING_ALLOW_TEST_RECEIPTS" "false" "${env_file}"
  env_set_if_empty "TRUST_PROXY" "true" "${env_file}"

  set_placeholder_secret_if_needed "POSTGRES_PASSWORD" 18 "${env_file}"
  set_placeholder_secret_if_needed "REDIS_PASSWORD" 18 "${env_file}"
  set_placeholder_secret_if_needed "NATS_PASSWORD" 18 "${env_file}"
  set_placeholder_secret_if_needed "JWT_SECRET" 32 "${env_file}"
  set_placeholder_secret_if_needed "BILLING_WEBHOOK_SECRET" 24 "${env_file}"
  set_placeholder_secret_if_needed "GRAFANA_ADMIN_PASSWORD" 18 "${env_file}"
  set_placeholder_secret_if_needed "DIRECTUS_KEY" 24 "${env_file}"
  set_placeholder_secret_if_needed "DIRECTUS_SECRET" 24 "${env_file}"
  set_placeholder_secret_if_needed "DIRECTUS_ADMIN_PASSWORD" 18 "${env_file}"

  if [[ -n "${CORS_ORIGIN_OVERRIDE}" ]]; then
    env_set "CORS_ORIGIN" "${CORS_ORIGIN_OVERRIDE}" "${env_file}"
  fi

  if [[ -n "${OPENAI_API_KEY_OVERRIDE}" ]]; then
    env_set "WORD_INSIGHT_PROVIDER" "openai" "${env_file}"
    env_set "OPENAI_API_KEY" "${OPENAI_API_KEY_OVERRIDE}" "${env_file}"
  fi

  if [[ -n "${DEEPSEEK_API_KEY_OVERRIDE}" ]]; then
    env_set "WORD_INSIGHT_PROVIDER" "deepseek" "${env_file}"
    env_set "DEEPSEEK_API_KEY" "${DEEPSEEK_API_KEY_OVERRIDE}" "${env_file}"
  fi
  if [[ -n "${DEEPSEEK_TIMEOUT_MS_OVERRIDE}" ]]; then
    if ! [[ "${DEEPSEEK_TIMEOUT_MS_OVERRIDE}" =~ ^[0-9]+$ ]]; then
      die "--deepseek-timeout-ms must be a positive integer"
    fi
    env_set "DEEPSEEK_TIMEOUT_MS" "${DEEPSEEK_TIMEOUT_MS_OVERRIDE}" "${env_file}"
  fi

  if [[ -n "${FIREBASE_PROJECT_ID_OVERRIDE}" ]]; then
    env_set "FIREBASE_PROJECT_ID" "${FIREBASE_PROJECT_ID_OVERRIDE}" "${env_file}"
  fi
  if [[ -n "${FIREBASE_CLIENT_EMAIL_OVERRIDE}" ]]; then
    env_set "FIREBASE_CLIENT_EMAIL" "${FIREBASE_CLIENT_EMAIL_OVERRIDE}" "${env_file}"
  fi
  if [[ -n "${FIREBASE_PRIVATE_KEY_OVERRIDE}" ]]; then
    env_set "FIREBASE_PRIVATE_KEY" "${FIREBASE_PRIVATE_KEY_OVERRIDE}" "${env_file}"
  fi
  if [[ -n "${FIREBASE_SERVICE_ACCOUNT_JSON_FILE}" ]]; then
    [[ -f "${FIREBASE_SERVICE_ACCOUNT_JSON_FILE}" ]] || die \
      "Firebase service-account file not found: ${FIREBASE_SERVICE_ACCOUNT_JSON_FILE}"
    # Keep .env single-line and avoid sed/newline issues by storing as base64.
    env_set "FIREBASE_SERVICE_ACCOUNT_JSON" \
      "$(base64 < "${FIREBASE_SERVICE_ACCOUNT_JSON_FILE}" | tr -d '\n')" "${env_file}"
  fi

  local pg_db pg_user pg_password redis_password nats_user nats_password
  pg_db="$(env_get "POSTGRES_DB" "${env_file}")"
  pg_user="$(env_get "POSTGRES_USER" "${env_file}")"
  pg_password="$(env_get "POSTGRES_PASSWORD" "${env_file}")"
  redis_password="$(env_get "REDIS_PASSWORD" "${env_file}")"
  nats_user="$(env_get "NATS_USER" "${env_file}")"
  nats_password="$(env_get "NATS_PASSWORD" "${env_file}")"

  env_set "DATABASE_URL" "postgres://${pg_user}:${pg_password}@postgres:5432/${pg_db}" "${env_file}"
  env_set "REDIS_URL" "redis://:${redis_password}@redis:6379/0" "${env_file}"
  env_set "NATS_URL" "nats://${nats_user}:${nats_password}@nats:4222" "${env_file}"

  local nats_url
  nats_url="$(env_get "NATS_URL" "${env_file}")"
  if [[ ! "${nats_url}" =~ ^nats://[^[:space:]]+$ ]]; then
    die "Invalid NATS_URL generated in ${env_file}: ${nats_url}"
  fi

  chmod 600 "${env_file}"
}

prepare_origin_tls_files() {
  local ssl_dir="${APP_DIR}/deployment/nginx/ssl"
  local cert_path="${ssl_dir}/origin.crt"
  local key_path="${ssl_dir}/origin.key"

  install -d -m 755 "${ssl_dir}"

  if [[ -n "${ORIGIN_CERT_SOURCE}" ]]; then
    [[ -f "${ORIGIN_CERT_SOURCE}" ]] || die "Origin cert source not found: ${ORIGIN_CERT_SOURCE}"
    cp "${ORIGIN_CERT_SOURCE}" "${cert_path}"
  fi

  if [[ -n "${ORIGIN_KEY_SOURCE}" ]]; then
    [[ -f "${ORIGIN_KEY_SOURCE}" ]] || die "Origin key source not found: ${ORIGIN_KEY_SOURCE}"
    cp "${ORIGIN_KEY_SOURCE}" "${key_path}"
  fi

  [[ -f "${cert_path}" ]] || die "Missing origin certificate at ${cert_path}"
  [[ -f "${key_path}" ]] || die "Missing origin private key at ${key_path}"

  chmod 644 "${cert_path}"
  chmod 600 "${key_path}"
}

validate_required_app_env() {
  local env_file="${APP_DIR}/deployment/env/.env.prod"
  local firebase_project firebase_client_email firebase_private_key firebase_service_json
  local provider openai_key deepseek_key cors_origin

  firebase_project="$(env_get "FIREBASE_PROJECT_ID" "${env_file}")"
  firebase_client_email="$(env_get "FIREBASE_CLIENT_EMAIL" "${env_file}")"
  firebase_private_key="$(env_get "FIREBASE_PRIVATE_KEY" "${env_file}")"
  firebase_service_json="$(env_get "FIREBASE_SERVICE_ACCOUNT_JSON" "${env_file}")"
  provider="$(env_get "WORD_INSIGHT_PROVIDER" "${env_file}")"
  openai_key="$(env_get "OPENAI_API_KEY" "${env_file}")"
  deepseek_key="$(env_get "DEEPSEEK_API_KEY" "${env_file}")"
  cors_origin="$(env_get "CORS_ORIGIN" "${env_file}")"

  [[ -n "${firebase_project}" ]] || die \
    "FIREBASE_PROJECT_ID is empty. Provide via --firebase-project-id or --env-source."
  if [[ -z "${firebase_service_json}" ]]; then
    [[ -n "${firebase_client_email}" ]] || die \
      "FIREBASE_CLIENT_EMAIL is empty. Set it or provide --firebase-service-account-json."
    [[ -n "${firebase_private_key}" ]] || die \
      "FIREBASE_PRIVATE_KEY is empty. Set it or provide --firebase-service-account-json."
  fi

  if [[ "${provider}" == "openai" && -z "${openai_key}" ]]; then
    die "WORD_INSIGHT_PROVIDER=openai but OPENAI_API_KEY is empty."
  fi
  if [[ "${provider}" == "deepseek" && -z "${deepseek_key}" ]]; then
    die "WORD_INSIGHT_PROVIDER=deepseek but DEEPSEEK_API_KEY is empty."
  fi
  if [[ -z "${cors_origin}" ]]; then
    warn "CORS_ORIGIN is empty; set it for production domains."
  fi

  if grep -q "change_this_" "${env_file}"; then
    warn ".env.prod still contains 'change_this_' placeholders."
  fi
}

configure_firewall_if_requested() {
  if [[ "${APPLY_FIREWALL}" != "true" ]]; then
    return
  fi

  [[ -n "${ADMIN_SSH_CIDR}" ]] || die "--admin-ssh-cidr is required with --apply-firewall"

  log "Configuring UFW"
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow from "${ADMIN_SSH_CIDR}" to any port 22 proto tcp

  local cidr
  while IFS= read -r cidr; do
    [[ -n "${cidr}" ]] || continue
    ufw allow proto tcp from "${cidr}" to any port 443
    if [[ "${ALLOW_HTTP}" == "true" ]]; then
      ufw allow proto tcp from "${cidr}" to any port 80
    fi
  done < <(
    {
      curl -fsSL "https://www.cloudflare.com/ips-v4"
      curl -fsSL "https://www.cloudflare.com/ips-v6"
    }
  )

  ufw --force enable
  ufw status verbose
}

run_migrations_and_deploy() {
  local update_cf_cmd="${APP_DIR}/deployment/scripts/update_cloudflare_real_ip.sh"
  local compose_file="${APP_DIR}/deployment/compose/docker-compose.prod.yml"
  local env_file="${APP_DIR}/deployment/env/.env.prod"

  [[ -x "${update_cf_cmd}" ]] || die "Missing executable script: ${update_cf_cmd}"
  require_cmd docker
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 plugin is required."

  local compose_profiles=""
  if [[ "${WITH_WORKERS}" == "true" ]]; then
    compose_profiles="workers"
  fi
  if [[ "${WITH_OBSERVABILITY}" == "true" ]]; then
    if [[ -n "${compose_profiles}" ]]; then
      compose_profiles="${compose_profiles},observability"
    else
      compose_profiles="observability"
    fi
  fi
  if [[ "${WITH_ADMIN}" == "true" ]]; then
    if [[ -n "${compose_profiles}" ]]; then
      compose_profiles="${compose_profiles},admin"
    else
      compose_profiles="admin"
    fi
  fi

  compose() {
    if [[ -n "${compose_profiles}" ]]; then
      COMPOSE_PROFILES="${compose_profiles}" \
        docker compose --env-file "${env_file}" -f "${compose_file}" "$@"
      return
    fi
    docker compose --env-file "${env_file}" -f "${compose_file}" "$@"
  }

  if [[ "${RESET_DATA_VOLUMES}" == "true" ]]; then
    warn "Resetting compose volumes with down -v (destructive)."
    compose down -v --remove-orphans || true
  fi

  log "Updating Cloudflare real-ip config"
  if ! "${update_cf_cmd}"; then
    warn "Failed to refresh Cloudflare real-ip list; continuing with existing config."
  fi

  if [[ "${SKIP_MIGRATE}" != "true" ]]; then
    log "Building API image for migration"
    compose build api-1

    log "Starting postgres dependency for migration"
    compose up -d postgres

    local attempts=0
    local max_attempts=90
    until compose exec -T postgres sh -lc \
      'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1'; do
      attempts=$((attempts + 1))
      if (( attempts >= max_attempts )); then
        compose logs --tail=120 postgres || true
        die "Postgres did not become ready in time."
      fi
      sleep 2
    done

    if [[ "${WITH_ADMIN}" == "true" ]]; then
      log "Starting directus dependency before migration"
      compose up -d directus

      local directus_attempts=0
      local directus_max_attempts=90
      until compose exec -T postgres sh -lc \
        'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT (to_regclass('\''public.directus_collections'\'') IS NOT NULL AND to_regclass('\''public.directus_fields'\'') IS NOT NULL)::int" | grep -qx 1'; do
        directus_attempts=$((directus_attempts + 1))
        if (( directus_attempts >= directus_max_attempts )); then
          compose logs --tail=120 directus postgres || true
          die "Directus metadata tables were not created in time."
        fi
        sleep 2
      done
    fi

    log "Running database migrations"
    compose run --rm --no-deps api-1 bun dist/migrate.js
  fi

  if [[ "${SKIP_DEPLOY}" != "true" ]]; then
    log "Deploying containers"
    if ! compose up -d --build; then
      warn "Compose up failed. Capturing diagnostics."
      compose ps -a || true
      compose logs --tail=200 postgres redis nats api-1 api-2 worker-1 worker-2 nginx || true
      die "Deployment failed during 'compose up'. See logs above."
    fi
    compose ps

    local nginx_container_id=""
    nginx_container_id="$(compose ps -q nginx || true)"
    if [[ -n "${nginx_container_id}" ]] && \
      docker ps --filter "id=${nginx_container_id}" --format '{{.ID}}' | grep -q .; then
      local health_attempts=0
      local health_max_attempts=40
      until curl -fsS http://127.0.0.1/healthz >/dev/null 2>&1; do
        health_attempts=$((health_attempts + 1))
        if (( health_attempts >= health_max_attempts )); then
          compose logs --tail=150 nginx api-1 api-2 || true
          die "Nginx health check failed on http://127.0.0.1/healthz"
        fi
        sleep 2
      done
      log "Local Nginx health check is passing"
    else
      warn "Nginx service is not up yet. Showing logs:"
      compose logs --tail=150 nginx api-1 api-2 || true
    fi
  fi
}

main() {
  parse_args "$@"
  require_root

  install_base_packages
  ensure_deploy_user
  harden_sshd_if_requested
  install_docker
  ensure_repo
  prepare_env
  prepare_origin_tls_files
  validate_required_app_env
  configure_firewall_if_requested
  run_migrations_and_deploy

  log "Completed."
  log "App directory: ${APP_DIR}"
  log "Env file: ${APP_DIR}/deployment/env/.env.prod"
}

main "$@"
