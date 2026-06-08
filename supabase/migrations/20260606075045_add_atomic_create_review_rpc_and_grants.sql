grant execute on function public.apply_review_action(uuid, text, uuid, text, text, timestamptz) to service_role;

create or replace function public.create_review_item_atomic(
  p_content_item_id uuid,
  p_review_type text,
  p_risk_level text,
  p_assigned_reviewer uuid,
  p_due_at timestamptz default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_content public.content_items%rowtype;
  v_review public.review_items%rowtype;
begin
  if p_review_type not in ('legal', 'tax', 'accounting', 'brand', 'translation') then
    raise exception 'Unsupported review type: %', p_review_type;
  end if;

  if p_risk_level not in ('low', 'medium', 'high') then
    raise exception 'Unsupported risk level: %', p_risk_level;
  end if;

  select *
  into v_content
  from public.content_items
  where id = p_content_item_id
  for update;

  if not found then
    raise exception 'Content item not found';
  end if;

  insert into public.review_items (
    content_item_id,
    assigned_reviewer,
    review_type,
    status,
    risk_level,
    due_at
  )
  values (
    p_content_item_id,
    p_assigned_reviewer,
    p_review_type,
    'in_review',
    p_risk_level,
    p_due_at
  )
  returning * into v_review;

  update public.content_items
  set status = 'in_review'
  where id = p_content_item_id
  returning * into v_content;

  return jsonb_build_object(
    'review', to_jsonb(v_review),
    'content', to_jsonb(v_content)
  );
end;
$$;

revoke all on function public.create_review_item_atomic(uuid, text, text, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.create_review_item_atomic(uuid, text, text, uuid, timestamptz) to service_role;
