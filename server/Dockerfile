FROM node:24.13.0-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini

FROM base AS deps
COPY package.json package-lock.json ./
COPY server/db/package.json ./server/db/
COPY server/control-plane/package.json ./server/control-plane/
COPY server/auth-gate/package.json ./server/auth-gate/
COPY server/activator/package.json ./server/activator/
COPY server/mcp-server/package.json ./server/mcp-server/
COPY web/package.json ./web/
RUN npm ci --omit=dev --ignore-scripts

FROM base AS build
COPY package.json package-lock.json tsconfig.base.json ./
COPY server/db/package.json ./server/db/
COPY server/control-plane/package.json ./server/control-plane/
COPY server/auth-gate/package.json ./server/auth-gate/
COPY server/activator/package.json ./server/activator/
COPY server/mcp-server/package.json ./server/mcp-server/
COPY web/package.json ./web/
RUN npm ci --ignore-scripts
COPY server ./server
RUN npm run build --workspace=@unlocalhost/db \
  && npm run build --workspace=@unlocalhost/control-plane \
  && npm run build --workspace=@unlocalhost/auth-gate \
  && npm run build --workspace=@unlocalhost/activator

FROM base AS runtime
ENV NODE_ENV=production
USER node
ENTRYPOINT ["/sbin/tini", "--"]

FROM runtime AS control-plane
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/db/dist ./server/db/dist
COPY --from=build /app/server/db/package.json ./server/db/
COPY --from=build /app/server/control-plane/dist ./server/control-plane/dist
COPY --from=build /app/server/control-plane/package.json ./server/control-plane/
EXPOSE 7000
CMD ["node", "server/control-plane/dist/index.js"]

FROM runtime AS auth-gate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/db/dist ./server/db/dist
COPY --from=build /app/server/db/package.json ./server/db/
COPY --from=build /app/server/auth-gate/dist ./server/auth-gate/dist
COPY --from=build /app/server/auth-gate/package.json ./server/auth-gate/
EXPOSE 7001
CMD ["node", "server/auth-gate/dist/index.js"]

FROM runtime AS activator
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/server/db/dist ./server/db/dist
COPY --from=build /app/server/db/package.json ./server/db/
COPY --from=build /app/server/activator/dist ./server/activator/dist
COPY --from=build /app/server/activator/package.json ./server/activator/
EXPOSE 7002
CMD ["node", "server/activator/dist/index.js"]
