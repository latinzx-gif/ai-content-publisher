insert into public.account_subscriptions (
  plan_id,
  status,
  current_period_start,
  current_period_end
)
select
  plans.id,
  'active',
  now(),
  now() + interval '100 years'
from public.plans
where plans.slug = 'basic'
  and not exists (
    select 1
    from public.account_subscriptions
    where status in ('trialing', 'active')
  );
