-- 5장: 작성 레이어 - drafts 테이블 생성
create table if not exists drafts (
  project_id uuid,
  item_id text,
  meta jsonb not null,          -- { title, description, slug, tags? }
  markdown text not null,
  version text default 'v1',
  updated_at timestamptz default now(),
  primary key (project_id, item_id)
);

-- 인덱스 추가 (프로젝트별 조회 최적화)
create index if not exists idx_drafts_project_id on drafts(project_id);
create index if not exists idx_drafts_updated_at on drafts(updated_at desc);