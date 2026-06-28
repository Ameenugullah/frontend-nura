FROM alpine:3.19

ARG PB_VERSION=0.23.4

RUN apk add --no-cache ca-certificates wget unzip

RUN wget -q \
    "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

WORKDIR /pb

COPY pb_migrations/ ./pb_migrations/
COPY pb_hooks/     ./pb_hooks/
COPY pb_data/      ./pb_data/

CMD /pb/pocketbase serve --http="0.0.0.0:${PORT:-8090}" --dir=/pb/pb_data --migrationsDir=/pb/pb_migrations --hooksDir=/pb/pb_hooks
