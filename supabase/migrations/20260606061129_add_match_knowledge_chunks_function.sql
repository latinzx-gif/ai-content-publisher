create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  category_filter text default null,
  min_score double precision default 0
)
returns table (
  chunk_id uuid,
  source_id uuid,
  source_title text,
  source_type text,
  category text,
  content text,
  metadata jsonb,
  score double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select *
  from (
    select
      kc.id as chunk_id,
      ks.id as source_id,
      ks.title as source_title,
      ks.source_type,
      ks.category,
      kc.content,
      kc.metadata,
      1 - (ke.embedding <=> query_embedding) as score
    from public.knowledge_embeddings ke
    join public.knowledge_chunks kc on kc.id = ke.knowledge_chunk_id
    join public.knowledge_sources ks on ks.id = kc.knowledge_source_id
    where ks.status = 'indexed'
      and (category_filter is null or ks.category = category_filter)
    order by ke.embedding <=> query_embedding
    limit greatest(match_count, 1)
  ) matches
  where matches.score >= min_score;
$$;

revoke all on function public.match_knowledge_chunks(vector(1536), int, text, double precision) from public, anon;
grant execute on function public.match_knowledge_chunks(vector(1536), int, text, double precision) to authenticated;
