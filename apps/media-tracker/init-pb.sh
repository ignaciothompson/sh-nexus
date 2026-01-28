#!/bin/sh
set -e

# Start PocketBase with migrations if schema exists
if [ -f "/pb/pb_schema.json" ]; then
    echo "Schema found. Importing collections..."
    # PocketBase will automatically handle imports
fi

# Start PocketBase server
exec /pb/pocketbase serve --http=0.0.0.0:8080
