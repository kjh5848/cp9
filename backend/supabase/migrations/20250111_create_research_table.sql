-- research 테이블 생성 (아이템 리서치 데이터 저장)
create table if not exists research (
  project_id uuid not null,
  item_id text not null,
  pack jsonb not null,        -- ResearchPack 데이터
  updated_at timestamptz default now(),
  primary key (project_id, item_id)
);

-- 인덱스 추가
create index if not exists idx_research_project_id on research(project_id);
create index if not exists idx_research_updated_at on research(updated_at desc);

-- RLS (Row Level Security) 설정 - 우선 비활성화
alter table research disable row level security;