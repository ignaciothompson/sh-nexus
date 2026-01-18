#!/bin/sh
set -e

echo "Starting PocketBase initialization..."

# Check if this is first run (no database file exists)
if [ ! -f /pb/pb_data/data.db ]; then
  echo "🔧 First run detected - initializing database schema..."
  
  # Import schema collections
  ./pocketbase migrate collections import /pb/pb_schema.json
  
  echo "✅ Schema imported successfully!"
else
  echo "📊 Database already exists, skipping initialization"
fi

# Start PocketBase
echo "🚀 Starting PocketBase server..."
exec ./pocketbase serve --http=0.0.0.0:8080
