# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

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

# Copy schema and init script
COPY pb_schema.json /pb/pb_schema.json
COPY init-pb.sh /pb/init-pb.sh
RUN chmod +x /pb/init-pb.sh

EXPOSE 8080

CMD ["/pb/init-pb.sh"]
