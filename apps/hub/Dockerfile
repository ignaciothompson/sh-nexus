# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the Angular app
# Assumes build output is in dist/<project-name>
RUN npx ng build --configuration production

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /pb

# Install dependencies (ca-certificates for downloading PB, unzip)
RUN apk add --no-cache ca-certificates unzip curl

# Download PocketBase (Change version as needed)
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

# Copy built frontend assets to PocketBase public directory
# Uses a wildcard to copy the contents of the built project folder
# NOTE: Ensure only one project folder exists in dist/ or adjust path
COPY --from=builder /app/dist/*/browser /pb/pb_public/

EXPOSE 8080

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
