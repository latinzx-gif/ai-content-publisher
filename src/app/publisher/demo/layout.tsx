import DemoAppShell from "@/components/publisher/demo/DemoAppShell";
import { DemoStoreProvider } from "@/lib/publisher/demo/store";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStoreProvider>
      {/* <DemoSchedulerGate /> — worker-2 mounts here */}
      <DemoAppShell>{children}</DemoAppShell>
    </DemoStoreProvider>
  );
}
