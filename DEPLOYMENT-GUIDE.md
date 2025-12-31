# ============================================
# CREDLINK - CLOUD RUN DEPLOYMENT GUIDE
# ============================================

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Docker** installed (for local testing)
4. **GCP Project** created (credlink-01)

## Quick Start (Windows)

```powershell
# Run the deployment script
.\deploy-cloudrun.ps1
```

## Quick Start (Linux/Mac)

```bash
# Make script executable
chmod +x deploy-cloudrun.sh

# Run the deployment script
./deploy-cloudrun.sh
```

---

## Step-by-Step Manual Setup

### 1. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project credlink-01
```

### 2. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Create Secrets in Secret Manager

```bash
# Database URL
echo -n "mysql://user:password@host:3306/credlink" | \
  gcloud secrets create DATABASE_URL --data-file=-

# JWT Secret (auto-generate)
openssl rand -base64 32 | \
  gcloud secrets create JWT_SECRET --data-file=-

# NextAuth Secret (auto-generate)
openssl rand -base64 32 | \
  gcloud secrets create NEXTAUTH_SECRET --data-file=-

# Firebase Client Email
echo -n "firebase-adminsdk@credlink-01.iam.gserviceaccount.com" | \
  gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-

# Firebase Private Key (from service account JSON)
cat firebase-key.json | jq -r '.private_key' | \
  gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-

# Cloudinary URL
echo -n "cloudinary://api_key:api_secret@cloud_name" | \
  gcloud secrets create CLOUDINARY_URL --data-file=-
```

### 4. Grant Secret Access to Cloud Run

```bash
# Get the Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe credlink-01 --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to each secret
for secret in DATABASE_URL JWT_SECRET NEXTAUTH_SECRET FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY CLOUDINARY_URL; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 5. Deploy Using Cloud Build

```bash
# Submit build
gcloud builds submit --config=cloudbuild.yaml
```

Or deploy manually:

```bash
# Build image
docker build -t gcr.io/credlink-01/credlink:latest \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4 \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=credlink-01.firebaseapp.com \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=credlink-01 \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=credlink-01.firebasestorage.app \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=226902678503 \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=1:226902678503:web:9847fb640dcc04f419fb42 \
  --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-58H2TTCVWH \
  .

# Push to GCR
docker push gcr.io/credlink-01/credlink:latest

# Deploy
gcloud run deploy credlink \
  --image gcr.io/credlink-01/credlink:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi
```

---

## Environment Variables

### Public Variables (Build-time)
These are embedded during build and safe to expose:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID |
| `NEXT_PUBLIC_APP_URL` | Application URL |

### Secret Variables (Runtime)
These are injected from GCP Secret Manager:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | JWT signing key |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `CLOUDINARY_URL` | Cloudinary connection string |

---

## Local Testing

### Using Docker Compose

```bash
# Create env file
cp .env.docker.example .env.docker

# Edit .env.docker with your values
# Then run:
docker-compose up --build
```

### Test Production Build Locally

```bash
docker build -t credlink:test .
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="test-secret" \
  credlink:test
```

---

## Monitoring & Logs

### View Logs

```bash
gcloud run services logs read credlink --region asia-south1 --limit 100
```

### Stream Logs

```bash
gcloud run services logs tail credlink --region asia-south1
```

### View Service Status

```bash
gcloud run services describe credlink --region asia-south1
```

---

## Troubleshooting

### Build Fails
1. Check if all required secrets exist in Secret Manager
2. Verify Docker build locally first
3. Check Cloud Build logs: `gcloud builds list`

### Container Crashes
1. Check logs for startup errors
2. Verify DATABASE_URL is correct
3. Ensure memory allocation is sufficient (1Gi recommended)

### Health Check Fails
1. Check `/api/health` endpoint
2. Verify database connection
3. Increase timeout if needed

### Prisma Issues
1. Run `npx prisma generate` before build
2. Ensure Prisma client is copied in Dockerfile
3. Check DATABASE_URL format

---

## File Structure

```
credlink/
├── Dockerfile               # Production Dockerfile
├── cloudbuild.yaml          # Cloud Build configuration
├── docker-compose.yml       # Local development setup
├── deploy-cloudrun.ps1      # Windows deployment script
├── deploy-cloudrun.sh       # Linux/Mac deployment script
├── .env.example             # Environment variable template
├── .env.production          # Public variables for production
└── .dockerignore            # Docker build exclusions
```

---

## Cost Optimization

- **Min instances: 0** - Scale to zero when not in use
- **Max instances: 10** - Prevent runaway costs
- **Memory: 1Gi** - Sufficient for Next.js + Prisma
- **CPU: 1** - Single CPU is enough for most loads
- **Concurrency: 80** - Handle multiple requests per instance

---

## Security Checklist

- [x] Secrets stored in GCP Secret Manager
- [x] Non-root user in container
- [x] HTTPS enforced by Cloud Run
- [x] Minimal base image (Alpine)
- [x] No sensitive data in build args
- [x] .env files in .gitignore
