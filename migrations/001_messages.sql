create table if not exists messages (
  id uuid primary key,
  token text not null unique,
  body text not null default '',
  audio_mime text,
  audio_data bytea,
  email text,
  deliver_at timestamptz not null,
  schedule_mode text not null,
  schedule_label text not null,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  notified_at timestamptz
);

create index if not exists messages_deliver_at_idx on messages (deliver_at);
create index if not exists messages_token_idx on messages (token);
