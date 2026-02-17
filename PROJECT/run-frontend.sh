#!/bin/bash
# Run in Cursor Terminal 2 (after backend is up)
cd "$(dirname "$0")/frontend"
npm install && npm run dev
