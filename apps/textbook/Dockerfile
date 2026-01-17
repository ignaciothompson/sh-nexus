# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npx ng build --configuration production

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /pb

RUN apk add --no-cache ca-certificates unzip curl

ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

COPY --from=builder /app/dist/*/browser /pb/pb_public/

EXPOSE 8080

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
