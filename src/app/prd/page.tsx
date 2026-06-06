const FIGMA_SITE_URL = 'https://cozy-ritzy-09485008.figma.site';

export default function PrdPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#020617]">
      <iframe
        src={FIGMA_SITE_URL}
        title="Create PRD for Content Platform"
        className="h-full w-full border-0"
        loading="lazy"
        allowFullScreen
      />
    </main>
  );
}
