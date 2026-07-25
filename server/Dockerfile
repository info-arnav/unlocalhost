FROM node:24.13.0-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini

FROM base AS deps
COPY package.json package-lock.json ./
COPY server/shared/package.json ./server/shared/
COPY server/gateway/package.json ./server/gateway/
COPY server/services/control-plane/package.json ./server/services/control-plane/
COPY server/services/auth-gate/package.json ./server/services/auth-gate/
COPY server/services/activator/package.json ./server/services/activator/
COPY server/services/mcp-server/package.json ./server/services/mcp-server/
COPY web/package.json ./web/
RUN npm ci --omit=dev --ignore-scripts

FROM base AS build
COPY package.json package-lock.json tsconfig.base.json ./
COPY server/shared/package.json ./server/shared/
COPY server/gateway/package.json ./server/gateway/
COPY server/services/control-plane/package.json ./server/services/control-plane/
COPY server/services/auth-gate/package.json ./server/services/auth-gate/
COPY server/services/activator/package.json ./server/services/activator/
COPY server/services/mcp-server/package.json ./server/services/mcp-server/
COPY web/package.json ./web/
RUN npm ci --ignore-scripts
COPY server ./server
RUN npm run build --workspace=@unlocalhost/shared \
  && npm run build --workspace=@unlocalhost/gateway \
  && npm run build --workspace=@unlocalhost/control-plane \
  && npm run build --workspace=@unlocalhost/auth-gate \
  && npm run build --workspace=@unlocalhost/activator

FROM base AS runtime
ENV NODE_ENV=production
USER node
ENTRYPOINT ["/sbin/tini", "--"]

FROM runtime AS gateway
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/shared/dist ./server/shared/dist
COPY --from=build /app/server/shared/package.json ./server/shared/
COPY --from=build /app/server/gateway/dist ./server/gateway/dist
COPY --from=build /app/server/gateway/package.json ./server/gateway/
EXPOSE 8000
CMD ["node", "server/gateway/dist/index.js"]

FROM runtime AS control-plane
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/shared/dist ./server/shared/dist
COPY --from=build /app/server/shared/package.json ./server/shared/
COPY --from=build /app/server/services/control-plane/dist ./server/services/control-plane/dist
COPY --from=build /app/server/services/control-plane/package.json ./server/services/control-plane/
EXPOSE 7100
CMD ["node", "server/services/control-plane/dist/index.js"]

FROM runtime AS auth-gate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/shared/dist ./server/shared/dist
COPY --from=build /app/server/shared/package.json ./server/shared/
COPY --from=build /app/server/services/auth-gate/dist ./server/services/auth-gate/dist
COPY --from=build /app/server/services/auth-gate/package.json ./server/services/auth-gate/
EXPOSE 7001
CMD ["node", "server/services/auth-gate/dist/index.js"]

FROM runtime AS activator
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/shared/dist ./server/shared/dist
COPY --from=build /app/server/shared/package.json ./server/shared/
COPY --from=build /app/server/services/activator/dist ./server/services/activator/dist
COPY --from=build /app/server/services/activator/package.json ./server/services/activator/
EXPOSE 7002
CMD ["node", "server/services/activator/dist/index.js"]
