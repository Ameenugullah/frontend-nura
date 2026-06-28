# ── Nura Bahar — PocketBase Dockerfile ──────────────────────────────────────
# Downloads the PocketBase binary at build time, copies your migrations and
# hooks, then serves on the PORT Railway injects at runtime.

FROM alpine:3.19

# PocketBase version — bump this when you upgrade locally
ARG PB_VERSION=0.22.4

# Install dependencies
RUN apk add --no-cache \
    ca-certificates \
    wget \
    unzip

# Download PocketBase
RUN wget -q \
    "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

WORKDIR /pb

# Copy your migrations and hooks into the image
COPY pb_migrations/ ./pb_migrations/
COPY pb_hooks/     ./pb_hooks/

# pb_data is where PocketBase stores its database and uploaded files.
# On Railway, mount a persistent volume to /pb/pb_data so data survives
# redeploys. Without a volume, data resets on every deploy.

# Railway sets $PORT at runtime — PocketBase must listen on 0.0.0.0:$PORT
# The shell form of CMD lets us expand $PORT correctly.
CMD /pb/pocketbase serve --http="0.0.0.0:${PORT:-8090}" \
    --dir=/pb/pb_data \
    --migrationsDir=/pb/pb_migrations \
    --hooksDir=/pb/pb_hooks