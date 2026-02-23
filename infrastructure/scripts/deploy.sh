#!/usr/bin/env bash
# ─────────────────────────────────────────────
# WFU Eats - Build & Deploy Script
# Usage: ./deploy.sh [build|push|migrate|deploy|all]
# ─────────────────────────────────────────────
set -euo pipefail

# ── Configuration ─────────────────────────
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BACKEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/wfu-eats/backend"
ECR_FRONTEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/wfu-eats/frontend"
ECS_CLUSTER="wfu-eats-cluster"
TAG="${TAG:-latest}"

RED='\033[0;31m'
GOLD='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GOLD}[WFU Eats]${NC} $1"; }
ok()  { echo -e "${GREEN}[✓]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── ECR Login ─────────────────────────────
ecr_login() {
  log "Logging into ECR..."
  aws ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
  ok "ECR login successful"
}

# ── Build Docker Images ──────────────────
build() {
  log "Building backend image..."
  docker build -t "wfu-eats-backend:${TAG}" ./backend/
  ok "Backend image built"

  # Get the ALB DNS for the frontend build arg
  ALB_DNS=$(cd infrastructure/terraform && terraform output -raw app_url 2>/dev/null || echo "http://localhost:4000")

  log "Building frontend image (API_URL=${ALB_DNS})..."
  docker build \
    --build-arg "NEXT_PUBLIC_API_URL=${ALB_DNS}" \
    -t "wfu-eats-frontend:${TAG}" \
    ./frontend/
  ok "Frontend image built"
}

# ── Push to ECR ──────────────────────────
push() {
  ecr_login

  log "Tagging and pushing backend..."
  docker tag "wfu-eats-backend:${TAG}" "${ECR_BACKEND}:${TAG}"
  docker push "${ECR_BACKEND}:${TAG}"
  ok "Backend pushed to ECR"

  log "Tagging and pushing frontend..."
  docker tag "wfu-eats-frontend:${TAG}" "${ECR_FRONTEND}:${TAG}"
  docker push "${ECR_FRONTEND}:${TAG}"
  ok "Frontend pushed to ECR"
}

# ── Run Database Migration ───────────────
migrate() {
  log "Running database migration..."
  # Get RDS endpoint from Terraform
  DB_HOST=$(cd infrastructure/terraform && terraform output -raw rds_endpoint | cut -d: -f1)
  DB_PASSWORD=$(cd infrastructure/terraform && terraform output -raw 2>/dev/null || echo "")

  if [ -z "$DB_HOST" ]; then
    err "Could not get RDS endpoint. Make sure Terraform has been applied."
  fi

  log "Connecting to ${DB_HOST}..."
  cd backend
  DB_HOST="$DB_HOST" DB_PORT=5432 DB_NAME=wfu_eats DB_USER=wfu_admin DB_SSL=true \
    node src/config/migrate.js
  ok "Migration complete"

  log "Seeding data..."
  DB_HOST="$DB_HOST" DB_PORT=5432 DB_NAME=wfu_eats DB_USER=wfu_admin DB_SSL=true \
    node src/seeds/seed.js
  ok "Seed complete"
  cd ..
}

# ── Force ECS Redeployment ───────────────
deploy_ecs() {
  log "Forcing ECS redeployment..."

  aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "wfu-eats-backend" \
    --force-new-deployment \
    --region "$AWS_REGION" > /dev/null
  ok "Backend redeployment triggered"

  aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "wfu-eats-frontend" \
    --force-new-deployment \
    --region "$AWS_REGION" > /dev/null
  ok "Frontend redeployment triggered"

  log "Waiting for services to stabilize..."
  aws ecs wait services-stable \
    --cluster "$ECS_CLUSTER" \
    --services "wfu-eats-backend" "wfu-eats-frontend" \
    --region "$AWS_REGION"
  ok "All services stable!"

  APP_URL=$(cd infrastructure/terraform && terraform output -raw app_url)
  echo ""
  echo -e "${GREEN}════════════════════════════════════════${NC}"
  echo -e "${GOLD}  WFU Eats deployed successfully!${NC}"
  echo -e "${GREEN}  ${APP_URL}${NC}"
  echo -e "${GREEN}════════════════════════════════════════${NC}"
}

# ── Main ─────────────────────────────────
case "${1:-all}" in
  build)   build ;;
  push)    push ;;
  migrate) migrate ;;
  deploy)  deploy_ecs ;;
  all)
    build
    push
    deploy_ecs
    ;;
  *)
    echo "Usage: $0 [build|push|migrate|deploy|all]"
    exit 1
    ;;
esac
