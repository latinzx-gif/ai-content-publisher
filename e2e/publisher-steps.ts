export type PublisherWorkflowStep = {
  index: number;
  name: string;
  heading: string;
  path: (postId: string) => string;
};

/** QA_CHECKLIST 12-step map → `/publisher/*` routes */
export const PUBLISHER_WORKFLOW_STEPS: PublisherWorkflowStep[] = [
  {
    index: 1,
    name: "Create",
    heading: "Create",
    path: () => "/publisher/create",
  },
  {
    index: 2,
    name: "Brief Builder",
    heading: "Brief Builder",
    path: (id) => `/publisher/briefs?post_id=${id}`,
  },
  {
    index: 3,
    name: "Rules",
    heading: "Rules",
    path: (id) => `/publisher/rules?post_id=${id}`,
  },
  {
    index: 4,
    name: "Content Generation",
    heading: "Content Generation",
    path: (id) => `/publisher/content-generation?post_id=${id}`,
  },
  {
    index: 5,
    name: "Image Prompts",
    heading: "Image Prompts",
    path: (id) => `/publisher/image-prompts?post_id=${id}`,
  },
  {
    index: 6,
    name: "Images",
    heading: "Images",
    path: (id) => `/publisher/images?post_id=${id}`,
  },
  {
    index: 7,
    name: "Quality Check",
    heading: "Quality Check",
    path: (id) => `/publisher/quality-check?post_id=${id}`,
  },
  {
    index: 8,
    name: "Review",
    heading: "Review & Editing",
    path: (id) => `/publisher/review?post_id=${id}`,
  },
  {
    index: 9,
    name: "Calendar",
    heading: "Calendar",
    path: () => "/publisher/calendar",
  },
  {
    index: 10,
    name: "Publishing",
    heading: "Publishing",
    path: () => "/publisher/publishing",
  },
  {
    index: 11,
    name: "Dashboard",
    heading: "Operations command center",
    path: () => "/publisher",
  },
  {
    index: 12,
    name: "Logs",
    heading: "Logs",
    path: () => "/publisher/logs",
  },
];
