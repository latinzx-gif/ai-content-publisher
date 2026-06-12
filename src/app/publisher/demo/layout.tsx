import DemoAppShell from "@/components/publisher/demo/DemoAppShell";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoAppShell>{children}</DemoAppShell>;
}
