#!/bin/bash
# Script to deploy the application to Google Cloud Run

# Set these variables according to your Google Cloud project
PROJECT_ID="ubb-mpp"
REGION="europe-west1"
SECRET_KEY="django-insecure&m&h=3n9*^+gco0zd4\$8j2&oa0^^)w+efuh!v488r-mytixwi67"

# Make sure gcloud is configured correctly
echo "Ensuring gcloud is configured with the correct project..."
gcloud config set project $PROJECT_ID

# Enable required services
echo "Enabling required services..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com

# Create Docker artifact repository
echo "Creating Docker repository..."
gcloud artifacts repositories create mpp-repository \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for MPP application"

# Authenticate Docker to GCP
echo "Authenticating Docker to GCP..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# Build and push Docker images using Cloud Build
echo "Building and pushing Docker images..."
gcloud builds submit --config cloudbuild.yaml .

# Deploy backend service to Cloud Run
echo "Deploying backend service..."
gcloud run deploy mpp-backend \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/mpp-repository/mpp-backend:latest \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars=SECRET_KEY=$SECRET_KEY,DEBUG=0

# Get the backend URL
BACKEND_URL=$(gcloud run services describe mpp-backend --platform=managed --region=$REGION --format='value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

# Deploy frontend service to Cloud Run
echo "Deploying frontend service..."
gcloud run deploy mpp-frontend \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/mpp-repository/mpp-frontend:latest \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars=NEXT_PUBLIC_API_URL=$BACKEND_URL

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe mpp-frontend --platform=managed --region=$REGION --format='value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

echo "Deployment complete!"