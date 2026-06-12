"use client";

import { createContext, useContext, useState } from "react";
import DemoSidebar from "./DemoSidebar";
import DemoRightPanel from "./DemoRightPanel";
import DemoComposeModal from "./DemoComposeModal";

interface ShellContextValue {
  openPost: (id: string) => void;
  closePost: () => void;
  selectedPostId: string | null;
  openCompose: () => void;
  closeCompose: () => void;
}

export const DemoShellContext = createContext<ShellContextValue>({
  openPost: () => {},
  closePost: () => {},
  selectedPostId: null,
  openCompose: () => {},
  closeCompose: () => {},
});

export function useDemoShell() {
  return useContext(DemoShellContext);
}

export default function DemoAppShell({ children }: { children: React.ReactNode }) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <DemoShellContext.Provider
      value={{
        openPost: setSelectedPostId,
        closePost: () => setSelectedPostId(null),
        selectedPostId,
        openCompose: () => setComposeOpen(true),
        closeCompose: () => setComposeOpen(false),
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <DemoSidebar />

        <div className="flex flex-1 overflow-hidden min-w-0">
          <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-white">
            {children}
          </main>

          {selectedPostId && (
            <DemoRightPanel
              postId={selectedPostId}
              onClose={() => setSelectedPostId(null)}
            />
          )}
        </div>
      </div>

      {/* Compose modal — rendered outside the flex layout so it overlays everything */}
      {composeOpen && <DemoComposeModal onClose={() => setComposeOpen(false)} />}
    </DemoShellContext.Provider>
  );
}
