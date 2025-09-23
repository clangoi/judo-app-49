#!/bin/bash

set -e

echo "🚀 GitHub Pages Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="mentalcheck-sports-training"
BRANCH="gh-pages"
BUILD_DIR="dist/public"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: This is not a git repository${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi

# Get repository URL
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    echo -e "${RED}❌ Error: No remote origin found${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
# Try npm ci first, fallback to npm install with legacy peer deps
npm ci || {
    echo -e "${YELLOW}⚠️  npm ci failed, trying npm install with legacy peer deps...${NC}"
    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps
}

echo -e "${YELLOW}🏗️  Building application for GitHub Pages...${NC}"
GITHUB_PAGES=true NODE_ENV=production npx vite build --config vite.config.pages.ts

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Error: Build directory $BUILD_DIR not found${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Preparing deployment files...${NC}"

# Create a temporary directory for deployment
TEMP_DIR=$(mktemp -d)
cp -r "$BUILD_DIR"/* "$TEMP_DIR/"

# Create .nojekyll file to prevent Jekyll processing
touch "$TEMP_DIR/.nojekyll"

# Create CNAME file if domain is specified
if [ ! -z "$CUSTOM_DOMAIN" ]; then
    echo "$CUSTOM_DOMAIN" > "$TEMP_DIR/CNAME"
fi

# Initialize git in temp directory
cd "$TEMP_DIR"
git init
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

echo -e "${YELLOW}🚀 Deploying to GitHub Pages...${NC}"

# Push to gh-pages branch
git remote add origin "$REPO_URL"
git branch -M "$BRANCH"
git push -f origin "$BRANCH"

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Your site will be available at: https://$(git config --get remote.origin.url | sed 's/.*github\.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/'/${NC}"
echo -e "${YELLOW}⏳ Note: It may take a few minutes for changes to appear${NC}"