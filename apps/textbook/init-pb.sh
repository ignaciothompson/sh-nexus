#!/bin/sh
set -e

echo "Starting PocketBase..."

# Just start PocketBase - admin will create account via /_/
# Collections will be imported manually after admin is created
exec ./pocketbase serve --http=0.0.0.0:8080
