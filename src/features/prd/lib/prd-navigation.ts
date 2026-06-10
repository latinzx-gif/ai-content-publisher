import { navGroups, pageMeta, type PageName } from '@/features/prd/config/navigation';

export type SearchParamReader = { get: (name: string) => string | null } | null;

export function toPrdRouteSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizePrdPageParam(value: string | null): PageName | null {
  if (!value) {
    return null;
  }

  const normalized = toPrdRouteSlug(value);
  const page = navGroups.flatMap((group) => group.items).find((item) => toPrdRouteSlug(item.name) === normalized);

  return (page?.name as PageName | undefined) ?? null;
}

export function normalizePrdTabParam(page: PageName, value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = toPrdRouteSlug(value);
  const tab = pageMeta[page]?.tabs.find((item) => toPrdRouteSlug(item) === normalized);

  return tab ?? value;
}

export function getInitialPrdPage() {
  if (typeof window === 'undefined') {
    return 'Dashboard' as PageName;
  }

  return normalizePrdPageParam(new URLSearchParams(window.location.search).get('page')) ?? 'Dashboard';
}

export function getInitialPrdTab(page: PageName) {
  if (typeof window === 'undefined') {
    return pageMeta[page]?.tabs?.[0] ?? 'All';
  }

  const tab = normalizePrdTabParam(page, new URLSearchParams(window.location.search).get('tab'));
  return tab ?? pageMeta[page]?.tabs?.[0] ?? 'All';
}

export function getPrdPageFromSearchParams(searchParams: SearchParamReader) {
  return normalizePrdPageParam(searchParams?.get('page') ?? null) ?? ('Dashboard' as PageName);
}

export function getPrdTabFromSearchParams(page: PageName, searchParams: SearchParamReader) {
  const tab = normalizePrdTabParam(page, searchParams?.get('tab') ?? null);
  return tab ?? pageMeta[page]?.tabs?.[0] ?? 'All';
}
