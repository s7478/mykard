# Cloud Run Deployment Guide

## 🚀 Deploy to Google Cloud Run

### Prerequisites
1. Google Cloud SDK installed: https://cloud.google.com/sdk/docs/install
2. Docker installed
3. Google Cloud project created with billing enabled

### Step 1: Setup Google Cloud
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project credlink-01

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 2: Create Secrets in Secret Manager
```bash
# DATABASE_URL
echo -n "mysql://u825197931_visitingCard:1qAPjf%26C%3E%21@srv1835.hstgr.io:3306/u825197931_visitingCard" | gcloud secrets create DATABASE_URL --data-file=-

# JWT_SECRET
echo -n "credlinkApp" | gcloud secrets create JWT_SECRET --data-file=-

# FIREBASE_CLIENT_EMAIL
echo -n "firebase-adminsdk-fbsvc@credlink-01.iam.gserviceaccount.com" | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-

# FIREBASE_PRIVATE_KEY (multiline)
cat > /tmp/firebase_key.txt << 'EOF'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoVenGzZ7coZKB
R1ldDk5Rbuyo2/g0hp/MKePr0E/casf91JYLJLj9hrxgQVDrpLEeQKrWHE4RyJy2
/k3O2/WrWwCPoy5V/YltW7FgBOo9Th0TKuQN/r032uhoXa+F61nRN5IUBf2LlHnE
BJLHIsI249E4CN8Uahtp7w8mSnTTZtD9vHDwDWrD87iNiA268rbTNzKenmgPk8Cr
1SNJfTxbly3/l6H5lXFQ0vrfVBxx9wkEoAq4smWRTzqM/L1rRQxL1m33QVbe3HYN
lrBNtZzJOF0aIJvIA9Bzkw27kjC8OhQZM0OnDaSNusWHv/0a6xZOU3/JkAdIX7aU
hR6v7HTXAgMBAAECggEABmqfNiePx6OKGf1r+T0U0MvS/KF/Us2Ys17tCc2d8JbW
IIhWjf5d5bWCbffA2ievknsu6saXbcTVkMdjIA78tUuuFSildiS86UytukSbgvVx
A4x7FAF89pIr11aUUQXawIGkNy2KL8dnWBQ/0jcygrTuvGM90T6Sh6nTkhi20xwB
bHPCF8CRq3AQx57haKjvFcDPLYm19hSBmdoEADq3B0Egr/jl6AAJHx6PDDWIxvST
UAwIxy9igKv3lTO+wx5A9kKIj8rrrNvqDewOplWjgPIiqxiJSmKYsB0NV/4ZDQUx
cSm8fWXxcnJt3eN+c+o4ruf1EokHjIkbOzJ9Ch0jIQKBgQDrDuyN79ai1iSpIaJM
T7pavddyuWdCkWyau8iuxk26QmtuaiAsiCwPbsmVL1MZ7DMh1tI9dnBzIntfI8RR
vwuqoaOyOs94PZ4MH93qB7VvV1/dTvIBXuDTSxsXJ8LG2unRc++U4Sbepb5dRNBP
2KYMIyq34PibpTZjJJa0LyfVcQKBgQC3VTc9oemqLn2Mkf0uyqXvYtle0nuM/6WX
q6aubyNmD0ecG1iBD7pWRxgqN8/UvTUFWKHY5BKdjBQyV4EvDpB61MdC4X4U8oEp
+JKyS+76TdaZ2JXyDAYCDQWRuZHzPEemv7tpsr/ia540+JyiaQCppiH92HIEPn0T
FkhBgYEqxwKBgQDpF8KSufxxO8PdCGJmJEXbSBiHRr3UMFuvUXoffryDcOwR8SF4
p4xxvV4fF2/j6+uEqf+QPYwjUFVhMhmzKq1KBsJKsrEcPpYk1dD9C6nrAI0q6+dm
Xoy6WudBXgdzpJBrSPmS/HbMITYWTW/5ThDTRmhNMcW2qu21AQqFIaHxsQKBgFhd
Nnb6Z4mjRthONV4sRraPSn4trWdUgRgNoBVLdCBpFPblJ09tqT6Unc0bgYzkdX3S
LpA/vck6DzIEgzuPJYxOqoxN61tlV2RHb02I0/LJObqFbiBwMyUh6aFHdFVspIx2
tXpIsbwMawDVI4oUWkFq1c9oV+w7wkVE5CbOqNdZAoGAS44wQB6wHx3Wa2CPkGSZ
6P9extAXARIlRS6Ucx3MTO3wSpEKi08jKJ72+SnMt/6RivTRTucUGBL8wg4mU9nS
zF/J7cUo1B4N6AUJfpEjOyZ2YyoJEX22zMvu/9zXAlMRYk7dJ/c+ROZ9aqsl28CP
YdMEll7AoDH/XShNwta3HEU=
-----END PRIVATE KEY-----
EOF
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=/tmp/firebase_key.txt
rm /tmp/firebase_key.txt

# CLOUDINARY_URL
echo -n "cloudinary://722424578963231:cBku03LYMZCDMcGTe9V8gcMmg8Q@dxmppxnst" | gcloud secrets create CLOUDINARY_URL --data-file=-
```

### Step 3: Grant Cloud Build Access to Secrets
```bash
# Get the Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe credlink-01 --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant access to all secrets
for secret in DATABASE_URL JWT_SECRET FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY CLOUDINARY_URL; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 4: Deploy Using Cloud Build
```bash
# Deploy from local directory
gcloud builds submit --config=cloudbuild.yaml .

# OR deploy from GitHub (after connecting repo)
gcloud builds submit --config=cloudbuild.yaml --substitutions=COMMIT_SHA=latest .
```

### Step 5: Setup Custom Domain (Optional)
```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create --service=credlink --domain=credlink.com --region=asia-south1
```

### Step 6: View Deployment
```bash
# Get service URL
gcloud run services describe credlink --region=asia-south1 --format="value(status.url)"

# View logs
gcloud run logs read credlink --region=asia-south1

# Check service status
gcloud run services list --region=asia-south1
```

## 🔧 Local Docker Testing (Before Cloud Deployment)

### Build Docker image locally:
```bash
docker build -t credlink:test .
```

### Run Docker container locally:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://u825197931_visitingCard:1qAPjf%26C%3E%21@srv1835.hstgr.io:3306/u825197931_visitingCard" \
  -e JWT_SECRET="credlinkApp" \
  -e FIREBASE_PROJECT_ID="credlink-01" \
  -e FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@credlink-01.iam.gserviceaccount.com" \
  -e FIREBASE_PRIVATE_KEY="$(cat .env | grep FIREBASE_PRIVATE_KEY | cut -d'=' -f2-)" \
  -e CLOUDINARY_URL="cloudinary://722424578963231:cBku03LYMZCDMcGTe9V8gcMmg8Q@dxmppxnst" \
  -e NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBCt_QhVfDJiuG6GXbI9_lqBHa3hDsmDV4" \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="credlink-01.firebaseapp.com" \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID="credlink-01" \
  -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="credlink-01.firebasestorage.app" \
  -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="226902678503" \
  -e NEXT_PUBLIC_FIREBASE_APP_ID="1:226902678503:web:9847fb640dcc04f419fb42" \
  -e NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-58H2TTCVWH" \
  credlink:test
```

### Test the container:
```bash
curl http://localhost:3000/api/health
```

## 🐛 Troubleshooting

### View Cloud Build logs:
```bash
gcloud builds list --limit=5
gcloud builds log <BUILD_ID>
```

### View Cloud Run logs:
```bash
gcloud run logs read credlink --region=asia-south1 --limit=50
```

### Check environment variables:
```bash
gcloud run services describe credlink --region=asia-south1 --format="yaml(spec.template.spec.containers[0].env)"
```

### Update service with new environment variables:
```bash
gcloud run services update credlink \
  --region=asia-south1 \
  --update-env-vars="KEY=VALUE"
```

## 📊 Monitoring

### Check service metrics:
```bash
# CPU usage
gcloud run services describe credlink --region=asia-south1 --format="value(status.latestCreatedRevisionName)"

# Logs in real-time
gcloud run logs tail credlink --region=asia-south1
```

## 💰 Cost Optimization

Cloud Run pricing:
- First 2 million requests per month: FREE
- $0.40 per million requests after that
- Memory: ~$0.0000025/GB-second
- CPU: ~$0.00002/vCPU-second

Current config (512Mi RAM, 1 CPU):
- ~$10-20/month for small to medium traffic
- Auto-scales to zero when no traffic = $0

## 🔒 Security Checklist

- ✅ Secrets stored in Secret Manager (not in code)
- ✅ Environment variables injected at deployment
- ✅ HTTPS enforced by default
- ✅ Service runs as non-root user
- ✅ Minimal Alpine image used

## 📝 Notes

- Region: `asia-south1` (Mumbai) - closest to India
- Max instances: 10 (adjust based on traffic)
- Memory: 512Mi (can increase if needed)
- CPU: 1 (can increase for better performance)
- Port: 3000 (Next.js default)
- Allow unauthenticated: Yes (public website)

## 🚀 Quick Commands

```bash
# One-command deploy (after secrets are set up)
gcloud builds submit --config=cloudbuild.yaml .

# View live URL
gcloud run services describe credlink --region=asia-south1 --format="value(status.url)"

# View logs
gcloud run logs tail credlink --region=asia-south1

# Delete service
gcloud run services delete credlink --region=asia-south1
```
