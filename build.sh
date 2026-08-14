#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Navigate to frontend, install packages, and compile React static bundle
cd frontend
npm install
npm run build
cd ..
