# GitHub Pages Deployment Makefile
# Usage: make deploy

.PHONY: help install build-pages deploy clean

# Default target
help:
	@echo "GitHub Pages Deployment Commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make build-pages  - Build application for GitHub Pages"
	@echo "  make deploy       - Deploy to GitHub Pages"
	@echo "  make clean        - Clean build files"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm ci

# Build for GitHub Pages
build-pages:
	@echo "🏗️  Building application for GitHub Pages..."
	GITHUB_PAGES=true NODE_ENV=production npx vite build --config vite.config.pages.ts

# Deploy to GitHub Pages
deploy: build-pages
	@echo "🚀 Deploying to GitHub Pages..."
	./deploy.sh

# Clean build files
clean:
	@echo "🧹 Cleaning build files..."
	rm -rf dist/public
	rm -rf node_modules/.vite