import DemoAppShell from "@/components/publisher/demo/DemoAppShell";
import { DemoStoreProvider } from "@/lib/publisher/demo/store";
import { DemoSchedulerGate } from "@/lib/publisher/demo/scheduler";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStoreProvider>
      <DemoSchedulerGate />
      <DemoAppShell>{children}</DemoAppShell>
    </DemoStoreProvider>
  );
}
