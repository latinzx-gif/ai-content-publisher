export function getWorkflowIdSeed(id: string) {
  return id.replace(/\D/g, '') || id;
}

export function getDashboardIdForWorkflowId(id: string) {
  if (id.startsWith('SW-')) {
    return id;
  }

  return `SW-${getWorkflowIdSeed(id)}`;
}

export function getReviewIdForWorkflowId(id: string) {
  if (id.startsWith('REV-')) {
    return id;
  }

  if (id.startsWith('PUB-')) {
    return id.replace('PUB-', 'REV-');
  }

  return `REV-${getWorkflowIdSeed(id)}`;
}

export function getPublishingIdForWorkflowId(id: string) {
  if (id.startsWith('PUB-')) {
    return id;
  }

  return getReviewIdForWorkflowId(id).replace('REV-', 'PUB-');
}
