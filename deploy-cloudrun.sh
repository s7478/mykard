#!/bin/bash
# ============================================
# CREDLINK CLOUD RUN DEPLOYMENT SCRIPT
# ============================================
# This script helps deploy CredLink to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-credlink-01}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="credlink"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   CREDLINK CLOUD RUN DEPLOYMENT${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Function to check secrets
check_secrets() {
    echo -e "${YELLOW}Checking GCP Secrets...${NC}"
    
    REQUIRED_SECRETS=(
        "DATABASE_URL"
        "JWT_SECRET"
        "NEXTAUTH_SECRET"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
        "CLOUDINARY_URL"
    )
    
    MISSING_SECRETS=()
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if ! gcloud secrets describe "$secret" --project="$PROJECT_ID" &> /dev/null; then
            MISSING_SECRETS+=("$secret")
        fi
    done
    
    if [ ${#MISSING_SECRETS[@]} -ne 0 ]; then
        echo -e "${RED}Missing secrets in GCP Secret Manager:${NC}"
        for secret in "${MISSING_SECRETS[@]}"; do
            echo -e "  - $secret"
        done
        echo ""
        echo -e "${YELLOW}Create them using:${NC}"
        echo "  gcloud secrets create SECRET_NAME --data-file=secret.txt --project=$PROJECT_ID"
        echo ""
        return 1
    fi
    
    echo -e "${GREEN}✓ All secrets are configured${NC}"
    return 0
}

# Function to setup secrets
setup_secrets() {
    echo -e "${YELLOW}Setting up GCP Secrets...${NC}"
    echo ""
    
    echo -e "${BLUE}Please provide the following secrets:${NC}"
    echo ""
    
    # DATABASE_URL
    if ! gcloud secrets describe "DATABASE_URL" --project="$PROJECT_ID" &> /dev/null; then
        echo -n "Enter DATABASE_URL (mysql://user:pass@host:3306/db): "
        read -r DATABASE_URL
        echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- --project="$PROJECT_ID"
        echo -e "${GREEN}✓ DATABASE_URL created${NC}"
    fi
    
    # JWT_SECRET
    if ! gcloud secrets describe "JWT_SECRET" --project="$PROJECT_ID" &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=- --project="$PROJECT_ID"
        echo -e "${GREEN}✓ JWT_SECRET created (auto-generated)${NC}"
    fi
    
    # NEXTAUTH_SECRET
    if ! gcloud secrets describe "NEXTAUTH_SECRET" --project="$PROJECT_ID" &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        echo -n "$NEXTAUTH_SECRET" | gcloud secrets create NEXTAUTH_SECRET --data-file=- --project="$PROJECT_ID"
        echo -e "${GREEN}✓ NEXTAUTH_SECRET created (auto-generated)${NC}"
    fi
    
    # FIREBASE_CLIENT_EMAIL
    if ! gcloud secrets describe "FIREBASE_CLIENT_EMAIL" --project="$PROJECT_ID" &> /dev/null; then
        echo -n "Enter FIREBASE_CLIENT_EMAIL: "
        read -r FIREBASE_CLIENT_EMAIL
        echo -n "$FIREBASE_CLIENT_EMAIL" | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=- --project="$PROJECT_ID"
        echo -e "${GREEN}✓ FIREBASE_CLIENT_EMAIL created${NC}"
    fi
    
    # FIREBASE_PRIVATE_KEY
    if ! gcloud secrets describe "FIREBASE_PRIVATE_KEY" --project="$PROJECT_ID" &> /dev/null; then
        echo "Enter path to Firebase private key JSON file: "
        read -r FIREBASE_KEY_PATH
        if [ -f "$FIREBASE_KEY_PATH" ]; then
            FIREBASE_PRIVATE_KEY=$(cat "$FIREBASE_KEY_PATH" | jq -r '.private_key')
            echo -n "$FIREBASE_PRIVATE_KEY" | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=- --project="$PROJECT_ID"
            echo -e "${GREEN}✓ FIREBASE_PRIVATE_KEY created${NC}"
        else
            echo -e "${RED}File not found: $FIREBASE_KEY_PATH${NC}"
        fi
    fi
    
    # CLOUDINARY_URL
    if ! gcloud secrets describe "CLOUDINARY_URL" --project="$PROJECT_ID" &> /dev/null; then
        echo -n "Enter CLOUDINARY_URL: "
        read -r CLOUDINARY_URL
        echo -n "$CLOUDINARY_URL" | gcloud secrets create CLOUDINARY_URL --data-file=- --project="$PROJECT_ID"
        echo -e "${GREEN}✓ CLOUDINARY_URL created${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✓ All secrets configured!${NC}"
}

# Function to build image locally
build_local() {
    echo -e "${YELLOW}Building Docker image locally...${NC}"
    
    docker build \
        -t "${IMAGE_NAME}:local" \
        --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4 \
        --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com \
        --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01 \
        --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app \
        --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503 \
        --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=1:226902678503:web:9847fb640dcc04f419fb42 \
        --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH \
        --build-arg NEXT_PUBLIC_APP_URL=https://credlink-226902678503.asia-south1.run.app \
        .
    
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
}

# Function to deploy using Cloud Build
deploy_cloud_build() {
    echo -e "${YELLOW}Deploying using Cloud Build...${NC}"
    
    gcloud builds submit \
        --config=cloudbuild.yaml \
        --project="$PROJECT_ID"
    
    echo -e "${GREEN}✓ Deployment initiated via Cloud Build${NC}"
}

# Function to deploy manually
deploy_manual() {
    echo -e "${YELLOW}Deploying manually to Cloud Run...${NC}"
    
    # Build and push
    TAG=$(date +%Y%m%d%H%M%S)
    
    echo "Building image..."
    docker build \
        -t "${IMAGE_NAME}:${TAG}" \
        -t "${IMAGE_NAME}:latest" \
        --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4 \
        --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com \
        --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01 \
        --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app \
        --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503 \
        --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=1:226902678503:web:9847fb640dcc04f419fb42 \
        --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH \
        --build-arg NEXT_PUBLIC_APP_URL=https://credlink-226902678503.asia-south1.run.app \
        .
    
    echo "Pushing to GCR..."
    docker push "${IMAGE_NAME}:${TAG}"
    docker push "${IMAGE_NAME}:latest"
    
    echo "Deploying to Cloud Run..."
    gcloud run deploy "$SERVICE_NAME" \
        --image "${IMAGE_NAME}:${TAG}" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --port 3000 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 300s \
        --concurrency 80 \
        --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,NEXT_TELEMETRY_DISABLED=1,FIREBASE_PROJECT_ID=credlink-01,FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503,NEXT_PUBLIC_FIREBASE_APP_ID=1:226902678503:web:9847fb640dcc04f419fb42,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH,NEXT_PUBLIC_APP_URL=https://credlink-226902678503.asia-south1.run.app" \
        --update-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,CLOUDINARY_URL=CLOUDINARY_URL:latest" \
        --project "$PROJECT_ID"
    
    echo -e "${GREEN}✓ Deployment complete!${NC}"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
    echo ""
    echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Choose an option:${NC}"
    echo "  1) Check secrets status"
    echo "  2) Setup secrets"
    echo "  3) Build Docker image locally"
    echo "  4) Deploy using Cloud Build (recommended)"
    echo "  5) Deploy manually"
    echo "  6) View service logs"
    echo "  7) Exit"
    echo ""
    echo -n "Enter option (1-7): "
}

# View logs
view_logs() {
    echo -e "${YELLOW}Fetching Cloud Run logs...${NC}"
    gcloud run services logs read "$SERVICE_NAME" \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --limit 50
}

# Main execution
main() {
    while true; do
        show_menu
        read -r option
        
        case $option in
            1)
                check_secrets
                ;;
            2)
                setup_secrets
                ;;
            3)
                build_local
                ;;
            4)
                deploy_cloud_build
                ;;
            5)
                deploy_manual
                ;;
            6)
                view_logs
                ;;
            7)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
    done
}

# Run main function
main
