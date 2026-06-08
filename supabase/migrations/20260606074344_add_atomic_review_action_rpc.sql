create or replace function public.apply_review_action(
  p_review_item_id uuid,
  p_action text,
  p_actor_profile_id uuid,
  p_note text default null,
  p_platform text default null,
  p_scheduled_at timestamptz default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_review public.review_items%rowtype;
  v_content public.content_items%rowtype;
  v_latest_action text;
  v_review_status text;
  v_content_status text;
  v_approval public.approval_events%rowtype;
  v_queue public.publishing_queue%rowtype;
begin
  if p_action not in ('approve', 'reject', 'request_changes', 'auto_queue') then
    raise exception 'Unsupported review action: %', p_action;
  end if;

  select *
  into v_review
  from public.review_items
  where id = p_review_item_id
  for update;

  if not found then
    raise exception 'Review item not found';
  end if;

  select *
  into v_content
  from public.content_items
  where id = v_review.content_item_id
  for update;

  if not found then
    raise exception 'Content item not found';
  end if;

  if p_action = 'auto_queue' then
    select action
    into v_latest_action
    from public.approval_events
    where content_item_id = v_review.content_item_id
    order by created_at desc
    limit 1;

    if v_review.status <> 'approved' or v_content.status <> 'approved' or coalesce(v_latest_action, '') <> 'approve' then
      raise exception 'Content must be approved before auto queue.';
    end if;

    insert into public.publishing_queue (
      content_item_id,
      platform,
      status,
      scheduled_at,
      created_by
    )
    values (
      v_review.content_item_id,
      coalesce(p_platform, 'linkedin'),
      'queued',
      p_scheduled_at,
      p_actor_profile_id
    )
    returning * into v_queue;

    v_review_status := 'approved';
    v_content_status := 'scheduled';
  else
    v_review_status := case p_action
      when 'approve' then 'approved'
      when 'reject' then 'rejected'
      when 'request_changes' then 'changes_requested'
    end;
    v_content_status := case p_action
      when 'approve' then 'approved'
      when 'reject' then 'rejected'
      when 'request_changes' then 'ready_for_review'
    end;
  end if;

  update public.review_items
  set
    status = v_review_status,
    updated_at = now()
  where id = v_review.id
  returning * into v_review;

  update public.content_items
  set status = v_content_status
  where id = v_review.content_item_id
  returning * into v_content;

  insert into public.approval_events (
    content_item_id,
    review_item_id,
    action,
    profile_id,
    note
  )
  values (
    v_review.content_item_id,
    v_review.id,
    p_action,
    p_actor_profile_id,
    p_note
  )
  returning * into v_approval;

  return jsonb_build_object(
    'review', to_jsonb(v_review),
    'content', to_jsonb(v_content),
    'approvalEvent', to_jsonb(v_approval),
    'queue', case when v_queue.id is null then null else to_jsonb(v_queue) end
  );
end;
$$;

revoke all on function public.apply_review_action(uuid, text, uuid, text, text, timestamptz) from public, anon, authenticated;
