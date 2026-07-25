FROM node:24.13.0-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini

FROM base AS build
COPY package.json package-lock.json tsconfig.base.json ./
COPY web/package.json ./web/
COPY server/shared/package.json ./server/shared/
COPY server/gateway/package.json ./server/gateway/
COPY server/services/control-plane/package.json ./server/services/control-plane/
COPY server/services/auth-gate/package.json ./server/services/auth-gate/
COPY server/services/activator/package.json ./server/services/activator/
COPY server/services/mcp-server/package.json ./server/services/mcp-server/
RUN npm ci --ignore-scripts
COPY web ./web
RUN npm run build --workspace=web

FROM base AS runtime
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
USER node
COPY --from=build --chown=node:node /app/web/.next/standalone ./
COPY --from=build --chown=node:node /app/web/.next/static ./web/.next/static
COPY --from=build --chown=node:node /app/web/public ./web/public
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "web/server.js"]
