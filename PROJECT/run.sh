#!/bin/bash
# Single command to run BrainBolt (with Docker)
set -e
cd "$(dirname "$0")"
echo "Starting BrainBolt (backend, frontend, MongoDB, Redis)..."
docker compose up --build
# Open http://localhost:3000 in your browser when you see "BrainBolt API listening"
