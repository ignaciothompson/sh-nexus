#!/bin/sh
set -e

# Import schema if it exists
if [ -f /pb/pb_schema.json ]; then
    echo "Importing PocketBase schema..."
    /pb/pocketbase migrate up 2>/dev/null || true
fi

# Start PocketBase
echo "Starting PocketBase..."
exec /pb/pocketbase serve --http=0.0.0.0:8080
