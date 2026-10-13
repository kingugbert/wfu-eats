#!/bin/bash
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="842675982987"
AWS_PROFILE="seminar"
ECR_BACKEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/wfu-eats/backend"
ECR_FRONTEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/wfu-eats/frontend"
ALB_URL="http://wfu-eats-alb-1922173148.us-east-1.elb.amazonaws.com"
GOOGLE_MAPS_KEY="${GOOGLE_MAPS_KEY:-YOUR_KEY_HERE}"
GOOGLE_PLACES_API_KEY="${GOOGLE_PLACES_API_KEY:-YOUR_KEY_HERE}"

echo "=== WFU Eats Deploy Script ==="
echo "AWS Account: ${AWS_ACCOUNT_ID}"
echo "Region: ${AWS_REGION}"
echo ""

# Login to ECR
echo ">> Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} --profile ${AWS_PROFILE} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build backend
echo ""
echo ">> Building backend..."
docker build --platform linux/amd64 --no-cache -t wfu-eats-backend ./backend

# Build frontend
echo ""
echo ">> Building frontend..."
docker build --platform linux/amd64 --no-cache \
  --build-arg NEXT_PUBLIC_API_URL=${ALB_URL} \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_KEY=${GOOGLE_MAPS_KEY} \
  -t wfu-eats-frontend ./frontend

# Tag and push backend
echo ""
echo ">> Pushing backend to ECR..."
docker tag wfu-eats-backend:latest ${ECR_BACKEND}:latest
docker push ${ECR_BACKEND}:latest

# Tag and push frontend
echo ""
echo ">> Pushing frontend to ECR..."
docker tag wfu-eats-frontend:latest ${ECR_FRONTEND}:latest
docker push ${ECR_FRONTEND}:latest

# Force new deployment
echo ""
echo ">> Forcing ECS redeployment..."
aws ecs update-service --cluster wfu-eats-cluster --service wfu-eats-backend --force-new-deployment --region ${AWS_REGION} --profile ${AWS_PROFILE} --no-cli-pager
aws ecs update-service --cluster wfu-eats-cluster --service wfu-eats-frontend --force-new-deployment --region ${AWS_REGION} --profile ${AWS_PROFILE} --no-cli-pager

echo ""
echo "=== Deploy complete! ==="
echo "App URL: ${ALB_URL}"
echo ""
echo "Next steps:"
echo "  1. Wait ~2 minutes for ECS to roll out"
echo "  2. Run migration (one-time):"
echo "     aws ecs run-task --cluster wfu-eats-cluster --task-definition wfu-eats-backend --launch-type FARGATE --network-configuration 'awsvpcConfiguration={subnets=[subnet-020518b20266dbe59,subnet-0fd10b0fd75532d2f],securityGroups=[sg-0a4d19bda6edc4581],assignPublicIp=ENABLED}' --overrides '{\"containerOverrides\":[{\"name\":\"backend\",\"command\":[\"node\",\"src/config/migrate.js\"]}]}' --region ${AWS_REGION} --profile ${AWS_PROFILE} --no-cli-pager"
echo "  3. Run seed (one-time):"
echo "     aws ecs run-task --cluster wfu-eats-cluster --task-definition wfu-eats-backend --launch-type FARGATE --network-configuration 'awsvpcConfiguration={subnets=[subnet-020518b20266dbe59,subnet-0fd10b0fd75532d2f],securityGroups=[sg-0a4d19bda6edc4581],assignPublicIp=ENABLED}' --overrides '{\"containerOverrides\":[{\"name\":\"backend\",\"command\":[\"node\",\"src/seeds/seed.js\"]}]}' --region ${AWS_REGION} --profile ${AWS_PROFILE} --no-cli-pager"
echo "  4. Sync Google restaurants:"
echo "     curl -X POST ${ALB_URL}/api/google/sync"
