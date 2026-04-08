FROM registry.access.redhat.com/ubi10/nodejs-24 AS builder
WORKDIR /build
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY app ./app
COPY components ./components
COPY content ./content
COPY lib ./lib
COPY public ./public
COPY next.config.mjs tsconfig.json tailwind.config.ts postcss.config.mjs global.d.ts ./
COPY CLAUDE.md ./
ARG GIT_SHA
ENV NEXT_PUBLIC_VERSION=$GIT_SHA
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile &&\
    pnpm run build

FROM registry.access.redhat.com/ubi10/nodejs-24-minimal AS base
COPY --from=builder /build/.next/standalone /workspace/
COPY --from=builder /build/.next/static /workspace/.next/static
COPY --from=builder /build/public /workspace/public
USER root
RUN mkdir -p /tmp/nextjscache
RUN chmod go+w /tmp/nextjscache
RUN ln -s /tmp/nextjscache /workspace/.next/cache
USER 1001
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=8000 \
    HOSTNAME="0.0.0.0"
CMD ["node", "/workspace/server.js"]
EXPOSE 8000
