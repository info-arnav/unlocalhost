import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const appStatus = pgEnum('app_status', [
  'building',
  'running',
  'sleeping',
  'failed',
]);

export const deploymentStatus = pgEnum('deployment_status', [
  'queued',
  'building',
  'succeeded',
  'failed',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    githubId: text('github_id').notNull(),
    email: text('email').notNull(),
    githubLogin: text('github_login').notNull(),
    githubInstallationId: text('github_installation_id'),
    scopedTokenEncrypted: text('scoped_token_encrypted'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('users_github_id_key').on(table.githubId),
    index('users_email_idx').on(table.email),
  ],
);

export const apps = pgTable(
  'apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subdomain: text('subdomain').notNull(),
    repoFullName: text('repo_full_name'),
    repoUrl: text('repo_url'),
    containerId: text('container_id'),
    status: appStatus('status').notNull().default('building'),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('apps_subdomain_key').on(table.subdomain),
    index('apps_owner_id_idx').on(table.ownerId),
    index('apps_status_last_active_idx').on(table.status, table.lastActiveAt),
  ],
);

export const deviceAuthorizations = pgTable(
  'device_authorizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceCodeHash: text('device_code_hash').notNull(),
    userCode: text('user_code').notNull(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('device_auth_device_code_key').on(table.deviceCodeHash),
    unique('device_auth_user_code_key').on(table.userCode),
  ],
);

export const apiTokens = pgTable(
  'api_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    label: text('label').notNull().default('mcp'),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('api_tokens_token_hash_key').on(table.tokenHash),
    index('api_tokens_user_id_idx').on(table.userId),
  ],
);

export const allowlist = pgTable(
  'allowlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('allowlist_app_id_email_key').on(table.appId, table.email),
  ],
);

export const envVars = pgTable(
  'env_vars',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    valueEncrypted: text('value_encrypted').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique('env_vars_app_id_key_key').on(table.appId, table.key)],
);

export const deployments = pgTable(
  'deployments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    commitSha: text('commit_sha'),
    status: deploymentStatus('status').notNull().default('queued'),
    logs: text('logs'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('deployments_app_id_created_idx').on(table.appId, table.createdAt),
  ],
);
