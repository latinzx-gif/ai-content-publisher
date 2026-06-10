export type CreateWorkflowStep = 1 | 2 | 3 | 4;

export const createWorkflowSteps: Array<{ index: CreateWorkflowStep; label: string }> = [
  { index: 1, label: 'Topic & Brief' },
  { index: 2, label: 'Source Search' },
  { index: 3, label: 'Generation' },
  { index: 4, label: 'Ready for Review' },
];

export const facebookLayoutGuidelines: Record<string, { title: string; size: string; guardrail: string; composerRule: string }> = {
  Single: {
    title: 'Facebook single image',
    size: 'Use 1200 x 1200 px (1:1), 960 x 1200 px (4:5), or 1200 x 600 px / 1920 x 1080 px for horizontal feed.',
    guardrail: 'Generate 1 primary image only. Do not compose as an album layout.',
    composerRule: 'Asset Composer must create one Facebook feed-safe image and preserve important text inside the central safe area.',
  },
  Grid: {
    title: 'Facebook square album / 4 images',
    size: 'Use 1920 x 1920 px for all 4 images (1:1).',
    guardrail: 'Keep exactly 4 layout-defining images. More than 4 can change Facebook album display behavior.',
    composerRule: 'Asset Composer must create four square images with consistent typography, spacing, and slide order.',
  },
  Carousel: {
    title: 'Facebook album carousel / story set',
    size: 'Use 1+2, 1+3, or 2+3 album rules: cover 960 x 1920, 1280 x 1920, or 1920 x 960/1280, with supporting images usually 1920 x 1920 or 1920 x 1280.',
    guardrail: 'Use 3 images for 1+2, 4 images for 1+3, or 5 images for 2+3. Images after the 5th do not control the main Facebook layout.',
    composerRule: 'Asset Composer must decide the album pattern first, then generate each image at the exact size required by that selected pattern.',
  },
};

export function getFacebookLayoutGuideline(layout: string, platforms: string[]) {
  const hasFacebook = platforms.some((platform) => platform.toLowerCase().includes('facebook'));
  return hasFacebook ? facebookLayoutGuidelines[layout] ?? null : null;
}

export function createNextDraftWorkflowId() {
  return `SW-${Date.now().toString().slice(-4)}`;
}
