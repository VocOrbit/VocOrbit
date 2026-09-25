#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_FILE="${ROOT_DIR}/deployment/nginx/cloudflare-real-ip.conf"
TMP_FILE="$(mktemp)"

cleanup() {
  rm -f "${TMP_FILE}"
}
trap cleanup EXIT

{
  curl -fsSL "https://www.cloudflare.com/ips-v4" | while read -r cidr; do
    [[ -n "${cidr}" ]] && echo "set_real_ip_from ${cidr};"
  done
  curl -fsSL "https://www.cloudflare.com/ips-v6" | while read -r cidr; do
    [[ -n "${cidr}" ]] && echo "set_real_ip_from ${cidr};"
  done
} > "${TMP_FILE}"

if [[ ! -s "${TMP_FILE}" ]]; then
  echo "Cloudflare IP list is empty, aborting." >&2
  exit 1
fi

mv "${TMP_FILE}" "${OUT_FILE}"
echo "Updated ${OUT_FILE}"
