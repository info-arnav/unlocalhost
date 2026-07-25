CREATE TYPE "public"."app_status" AS ENUM('building', 'running', 'sleeping', 'failed');--> statement-breakpoint
CREATE TYPE "public"."deployment_status" AS ENUM('queued', 'building', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "allowlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "allowlist_app_id_email_key" UNIQUE("app_id","email")
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"subdomain" text NOT NULL,
	"repo_url" text,
	"container_id" text,
	"status" "app_status" DEFAULT 'building' NOT NULL,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apps_subdomain_key" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"commit_sha" text,
	"status" "deployment_status" DEFAULT 'queued' NOT NULL,
	"logs" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "env_vars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value_encrypted" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "env_vars_app_id_key_key" UNIQUE("app_id","key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_id" text NOT NULL,
	"email" text NOT NULL,
	"github_login" text NOT NULL,
	"scoped_token_encrypted" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_github_id_key" UNIQUE("github_id")
);
--> statement-breakpoint
ALTER TABLE "allowlist" ADD CONSTRAINT "allowlist_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "env_vars" ADD CONSTRAINT "env_vars_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apps_owner_id_idx" ON "apps" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "apps_status_last_active_idx" ON "apps" USING btree ("status","last_active_at");--> statement-breakpoint
CREATE INDEX "deployments_app_id_created_idx" ON "deployments" USING btree ("app_id","created_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");