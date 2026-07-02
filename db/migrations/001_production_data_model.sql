-- OTA Social Engine Phase 9C-1 production data model
-- Target: PostgreSQL 15+ on Amazon RDS.
-- Rule: this schema stores workflow state, metadata, refs, and audit records.
-- It must never store plaintext stream keys, OAuth tokens, passwords, or client secrets.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table brands (
  id uuid primary key default gen_random_uuid(),
  external_key text unique,
  name text not null,
  slug text not null unique,
  domain text,
  owner_name text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  priority text not null default 'P1',
  governance_boundary text not null default '',
  no_phi boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_platforms (
  id uuid primary key default gen_random_uuid(),
  platform_key text not null unique,
  name text not null,
  priority text not null default 'P1',
  restream_platform_id integer,
  required_fields text[] not null default '{}',
  profile_guidance text not null default '',
  media_guidance text not null default '',
  evidence_guidance text not null default '',
  restream_guidance text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_profiles (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  platform_id uuid not null references social_platforms(id),
  external_key text unique,
  priority text not null default 'P1',
  target_handle text not null default '',
  actual_handle text not null default '',
  profile_url text not null default '',
  display_name text not null default '',
  bio text not null default '',
  website_url text not null default '',
  profile_image_asset_id uuid,
  banner_asset_id uuid,
  business_account_status text not null default 'unknown',
  ownership_state text not null default 'human_action_required',
  security_state text not null default 'unknown',
  profile_state text not null default 'incomplete',
  connector_state text not null default 'none',
  publishing_state text not null default 'none',
  blocked boolean not null default false,
  blocked_reason text not null default '',
  next_action text not null default '',
  ready_for_connector boolean not null default false,
  ready_for_publishing boolean not null default false,
  source_system text not null default 'app',
  sync_status text not null default 'not_synced',
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, platform_id)
);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  profile_id uuid references social_profiles(id) on delete set null,
  asset_type text not null,
  asset_name text not null,
  file_name text not null default '',
  mime_type text not null default '',
  width integer,
  height integer,
  duration_seconds numeric(12, 3),
  file_size_bytes bigint,
  usage_context text not null default '',
  description text not null default '',
  storage_provider text not null default 's3',
  storage_bucket text not null default '',
  storage_key text not null default '',
  public_url text not null default '',
  platform_asset_url text not null default '',
  platform_status text not null default 'not_observed',
  source_system text not null default 'app',
  approval_state text not null default 'needs_review',
  approved_by_user_id uuid,
  approved_at timestamptz,
  observed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table social_profiles
  add constraint social_profiles_profile_image_asset_fk
  foreign key (profile_image_asset_id) references media_assets(id) on delete set null;

alter table social_profiles
  add constraint social_profiles_banner_asset_fk
  foreign key (banner_asset_id) references media_assets(id) on delete set null;

create table evidence_records (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  profile_id uuid references social_profiles(id) on delete cascade,
  evidence_type text not null,
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'superseded')),
  evidence_url text not null default '',
  storage_provider text not null default '',
  storage_bucket text not null default '',
  storage_key text not null default '',
  source_system text not null default 'app',
  reviewed_by_user_id uuid,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table credential_refs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  profile_id uuid references social_profiles(id) on delete cascade,
  credential_type text not null,
  secret_provider text not null default 'aws-secrets-manager',
  secret_ref text not null,
  ref_field text not null,
  rotated_by_user_id uuid,
  rotated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (profile_id, credential_type)
);

create table restream_candidates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references social_profiles(id) on delete cascade,
  platform_id integer,
  display_name text not null default '',
  stream_url_credential_ref_id uuid references credential_refs(id) on delete set null,
  stream_key_credential_ref_id uuid references credential_refs(id) on delete set null,
  rtmp_username_credential_ref_id uuid references credential_refs(id) on delete set null,
  rtmp_password_credential_ref_id uuid references credential_refs(id) on delete set null,
  restream_access_token_credential_ref_id uuid references credential_refs(id) on delete set null,
  restream_refresh_token_credential_ref_id uuid references credential_refs(id) on delete set null,
  restream_client_id_credential_ref_id uuid references credential_refs(id) on delete set null,
  restream_client_secret_credential_ref_id uuid references credential_refs(id) on delete set null,
  instagram_username text not null default '',
  approval_state text not null default 'draft' check (approval_state in ('draft', 'approved', 'rejected', 'submitted')),
  approved_by_user_id uuid,
  approved_at timestamptz,
  ready_for_submit boolean not null default false,
  restream_channel_id text not null default '',
  restream_response jsonb not null default '{}'::jsonb,
  restream_channel_validation jsonb not null default '{}'::jsonb,
  blocked_reason text not null default '',
  next_action text not null default '',
  source_system text not null default 'app',
  sync_status text not null default 'not_synced',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table platform_scans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references social_profiles(id) on delete cascade,
  source_url text not null,
  http_status integer,
  status text not null default 'completed',
  title text not null default '',
  description text not null default '',
  assets_found integer not null default 0,
  assets_recorded integer not null default 0,
  sanitized_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table app_users (
  id uuid primary key default gen_random_uuid(),
  external_subject text unique,
  display_name text not null,
  email text unique,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  label text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  label text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table user_brand_roles (
  user_id uuid not null references app_users(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, brand_id, role_id)
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete set null,
  profile_id uuid references social_profiles(id) on delete set null,
  actor_user_id uuid references app_users(id) on delete set null,
  actor_label text not null default '',
  event_type text not null,
  action text not null,
  detail text not null default '',
  status text not null default 'recorded',
  source_system text not null default 'app',
  request_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sync_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid not null,
  target_system text not null,
  operation text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'synced', 'failed', 'dead_letter')),
  attempts integer not null default 0,
  last_error text not null default '',
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_social_profiles_brand on social_profiles(brand_id);
create index idx_social_profiles_platform on social_profiles(platform_id);
create index idx_media_assets_profile on media_assets(profile_id);
create index idx_media_assets_brand on media_assets(brand_id);
create index idx_evidence_profile on evidence_records(profile_id);
create index idx_restream_candidates_profile on restream_candidates(profile_id);
create index idx_audit_events_brand_created on audit_events(brand_id, created_at desc);
create index idx_audit_events_profile_created on audit_events(profile_id, created_at desc);
create index idx_sync_outbox_status_available on sync_outbox(status, available_at);

create trigger trg_brands_updated_at before update on brands for each row execute function set_updated_at();
create trigger trg_social_platforms_updated_at before update on social_platforms for each row execute function set_updated_at();
create trigger trg_social_profiles_updated_at before update on social_profiles for each row execute function set_updated_at();
create trigger trg_media_assets_updated_at before update on media_assets for each row execute function set_updated_at();
create trigger trg_evidence_records_updated_at before update on evidence_records for each row execute function set_updated_at();
create trigger trg_restream_candidates_updated_at before update on restream_candidates for each row execute function set_updated_at();
create trigger trg_app_users_updated_at before update on app_users for each row execute function set_updated_at();
create trigger trg_roles_updated_at before update on roles for each row execute function set_updated_at();
create trigger trg_sync_outbox_updated_at before update on sync_outbox for each row execute function set_updated_at();

insert into permissions (permission_key, label, description) values
  ('edit_profile', 'Edit Profile', 'Edit brand social profile fields.'),
  ('record_asset', 'Record Asset', 'Record or upload media asset metadata.'),
  ('record_evidence', 'Record Evidence', 'Record ownership, security, profile, approval, or connector evidence.'),
  ('store_secret', 'Store Secret', 'Store or rotate credential references through the backend.'),
  ('approve_connector', 'Approve Connector', 'Approve and validate connector candidates.'),
  ('submit_connector', 'Submit Connector', 'Submit approved connector work to an external platform.'),
  ('view_assigned_brand', 'View Assigned Brand', 'View assigned brand records.'),
  ('view_all_brands', 'View All Brands', 'View all brand records.')
on conflict (permission_key) do nothing;

insert into roles (role_key, label, description) values
  ('super_admin', 'Super Admin', 'Full platform operator.'),
  ('brand_owner', 'Brand Owner', 'Business-side owner for assigned brand.'),
  ('operator', 'Operator', 'Default profile, asset, and evidence operator.'),
  ('asset_reviewer', 'Asset Reviewer', 'Media and evidence reviewer.'),
  ('connector_approver', 'Connector Approver', 'Connector and credential approval operator.'),
  ('read_only_reviewer', 'Read-Only Reviewer', 'Read-only reviewer.')
on conflict (role_key) do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on (
  (r.role_key = 'super_admin') or
  (r.role_key = 'brand_owner' and p.permission_key in ('edit_profile', 'record_asset', 'record_evidence', 'approve_connector', 'view_assigned_brand')) or
  (r.role_key = 'operator' and p.permission_key in ('edit_profile', 'record_asset', 'record_evidence', 'view_assigned_brand')) or
  (r.role_key = 'asset_reviewer' and p.permission_key in ('record_asset', 'record_evidence', 'view_assigned_brand')) or
  (r.role_key = 'connector_approver' and p.permission_key in ('record_evidence', 'store_secret', 'approve_connector', 'submit_connector', 'view_assigned_brand')) or
  (r.role_key = 'read_only_reviewer' and p.permission_key in ('view_assigned_brand'))
)
on conflict do nothing;
