# ============================================
# CREDLINK CLOUD RUN DEPLOYMENT SCRIPT (PowerShell)
# ============================================
# This script helps deploy CredLink to Google Cloud Run on Windows

param(
    [string]$Action = "menu"
)

# Configuration
$PROJECT_ID = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { "credlink-01" }
$REGION = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$SERVICE_NAME = "credlink"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Header {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host "   CREDLINK CLOUD RUN DEPLOYMENT" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
}

# Check prerequisites
function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    # Check gcloud
    if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
        Write-Host "Error: gcloud CLI is not installed" -ForegroundColor Red
        Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
        return $false
    }
    Write-Host "✓ gcloud CLI found" -ForegroundColor Green
    
    # Check docker
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Host "Error: Docker is not installed" -ForegroundColor Red
        Write-Host "Please install Docker from: https://docs.docker.com/get-docker/"
        return $false
    }
    Write-Host "✓ Docker found" -ForegroundColor Green
    
    return $true
}

# Check secrets
function Test-Secrets {
    Write-Host "Checking GCP Secrets..." -ForegroundColor Yellow
    
    $requiredSecrets = @(
        "DATABASE_URL",
        "JWT_SECRET",
        "NEXTAUTH_SECRET",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_PRIVATE_KEY",
        "CLOUDINARY_URL"
    )
    
    $missingSecrets = @()
    
    foreach ($secret in $requiredSecrets) {
        $result = gcloud secrets describe $secret --project=$PROJECT_ID 2>&1
        if ($LASTEXITCODE -ne 0) {
            $missingSecrets += $secret
        }
    }
    
    if ($missingSecrets.Count -gt 0) {
        Write-Host "Missing secrets in GCP Secret Manager:" -ForegroundColor Red
        foreach ($secret in $missingSecrets) {
            Write-Host "  - $secret" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "Create them using option 2 (Setup secrets)" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✓ All secrets are configured" -ForegroundColor Green
    return $true
}

# Setup secrets
function Set-Secrets {
    Write-Host "Setting up GCP Secrets..." -ForegroundColor Yellow
    Write-Host ""
    
    # DATABASE_URL
    $result = gcloud secrets describe "DATABASE_URL" --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        $dbUrl = Read-Host "Enter DATABASE_URL (mysql://user:pass@host:3306/db)"
        $dbUrl | gcloud secrets create DATABASE_URL --data-file=- --project=$PROJECT_ID
        Write-Host "✓ DATABASE_URL created" -ForegroundColor Green
    }
    
    # JWT_SECRET
    $result = gcloud secrets describe "JWT_SECRET" --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $jwtSecret | gcloud secrets create JWT_SECRET --data-file=- --project=$PROJECT_ID
        Write-Host "✓ JWT_SECRET created (auto-generated)" -ForegroundColor Green
    }
    
    # NEXTAUTH_SECRET
    $result = gcloud secrets describe "NEXTAUTH_SECRET" --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        $nextAuthSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $nextAuthSecret | gcloud secrets create NEXTAUTH_SECRET --data-file=- --project=$PROJECT_ID
        Write-Host "✓ NEXTAUTH_SECRET created (auto-generated)" -ForegroundColor Green
    }
    
    # FIREBASE_CLIENT_EMAIL
    $result = gcloud secrets describe "FIREBASE_CLIENT_EMAIL" --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        $firebaseEmail = Read-Host "Enter FIREBASE_CLIENT_EMAIL"
        $firebaseEmail | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=- --project=$PROJECT_ID
        Write-Host "✓ FIREBASE_CLIENT_EMAIL created" -ForegroundColor Green
    }
    
    # FIREBASE_PRIVATE_KEY
    $result = gcloud secrets describe "FIREBASE_PRIVATE_KEY" --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        $keyPath = Read-Host "Enter path to Firebase private key JSON file"
        if (Test-Path $keyPath) {
            $jsonContent = Get-Content $keyPath -Raw | ConvertFrom-Json
            $privateKey = $jsonContent.private_key
            $privateKey | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=- --project=$PROJECT_ID
            Write-Host "✓ FIREBASE_PRIVATE_KEY created" -ForegroundColor Green
        } else {
            Write-Host "File not found: $keyPath" -ForegroundColor Red
        }
    }
    
    # CLOUDINARY_URL
    $result = gcloud secrets describe "CLOUDINARY_URL" --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        $cloudinaryUrl = Read-Host "Enter CLOUDINARY_URL"
        $cloudinaryUrl | gcloud secrets create CLOUDINARY_URL --data-file=- --project=$PROJECT_ID
        Write-Host "✓ CLOUDINARY_URL created" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✓ All secrets configured!" -ForegroundColor Green
}

# Build Docker image locally
function Build-LocalImage {
    Write-Host "Building Docker image locally..." -ForegroundColor Yellow
    
    docker build `
        -t "${IMAGE_NAME}:local" `
        --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4 `
        --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com `
        --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01 `
        --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app `
        --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503 `
        --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:226902678503:web:9847fb640dcc04f419fb42" `
        --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH `
        --build-arg NEXT_PUBLIC_APP_URL=https://credlink-226902678503.asia-south1.run.app `
        .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker image built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker build failed" -ForegroundColor Red
    }
}

# Deploy using Cloud Build
function Deploy-CloudBuild {
    Write-Host "Deploying using Cloud Build..." -ForegroundColor Yellow
    
    gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Deployment initiated via Cloud Build" -ForegroundColor Green
    } else {
        Write-Host "✗ Cloud Build deployment failed" -ForegroundColor Red
    }
}

# Deploy manually
function Deploy-Manual {
    Write-Host "Deploying manually to Cloud Run..." -ForegroundColor Yellow
    
    $TAG = Get-Date -Format "yyyyMMddHHmmss"
    
    Write-Host "Building image..."
    docker build `
        -t "${IMAGE_NAME}:${TAG}" `
        -t "${IMAGE_NAME}:latest" `
        --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4 `
        --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com `
        --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01 `
        --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app `
        --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503 `
        --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="1:226902678503:web:9847fb640dcc04f419fb42" `
        --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH `
        --build-arg NEXT_PUBLIC_APP_URL=https://credlink-226902678503.asia-south1.run.app `
        .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker build failed" -ForegroundColor Red
        return
    }
    
    Write-Host "Pushing to GCR..."
    docker push "${IMAGE_NAME}:${TAG}"
    docker push "${IMAGE_NAME}:latest"
    
    Write-Host "Deploying to Cloud Run..."
    gcloud run deploy $SERVICE_NAME `
        --image "${IMAGE_NAME}:${TAG}" `
        --region $REGION `
        --platform managed `
        --allow-unauthenticated `
        --port 3000 `
        --memory 1Gi `
        --cpu 1 `
        --min-instances 0 `
        --max-instances 10 `
        --timeout 300s `
        --concurrency 80 `
        --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,NEXT_TELEMETRY_DISABLED=1,FIREBASE_PROJECT_ID=credlink-01,FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503,NEXT_PUBLIC_FIREBASE_APP_ID=1:226902678503:web:9847fb640dcc04f419fb42,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH,NEXT_PUBLIC_APP_URL=https://credlink-226902678503.asia-south1.run.app" `
        --update-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,CLOUDINARY_URL=CLOUDINARY_URL:latest" `
        --project $PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Deployment complete!" -ForegroundColor Green
        
        $serviceUrl = gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)'
        Write-Host ""
        Write-Host "Service URL: $serviceUrl" -ForegroundColor Green
    } else {
        Write-Host "✗ Deployment failed" -ForegroundColor Red
    }
}

# View logs
function Get-ServiceLogs {
    Write-Host "Fetching Cloud Run logs..." -ForegroundColor Yellow
    gcloud run services logs read $SERVICE_NAME `
        --region $REGION `
        --project $PROJECT_ID `
        --limit 50
}

# Show menu
function Show-Menu {
    Write-Header
    
    Write-Host "Project: $PROJECT_ID" -ForegroundColor Cyan
    Write-Host "Region: $REGION" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor Blue
    Write-Host "  1) Check prerequisites"
    Write-Host "  2) Check secrets status"
    Write-Host "  3) Setup secrets"
    Write-Host "  4) Build Docker image locally"
    Write-Host "  5) Deploy using Cloud Build (recommended)"
    Write-Host "  6) Deploy manually"
    Write-Host "  7) View service logs"
    Write-Host "  8) Exit"
    Write-Host ""
}

# Main execution
function Main {
    while ($true) {
        Show-Menu
        $option = Read-Host "Enter option (1-8)"
        
        switch ($option) {
            "1" { Test-Prerequisites }
            "2" { Test-Secrets }
            "3" { Set-Secrets }
            "4" { Build-LocalImage }
            "5" { Deploy-CloudBuild }
            "6" { Deploy-Manual }
            "7" { Get-ServiceLogs }
            "8" { 
                Write-Host "Goodbye!" -ForegroundColor Green
                return 
            }
            default { Write-Host "Invalid option" -ForegroundColor Red }
        }
        
        Write-Host ""
        Write-Host "Press Enter to continue..."
        Read-Host
    }
}

# Run
Main
