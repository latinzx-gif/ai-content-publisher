'use client';

import { LeftSidebar }        from './LeftSidebar';
import { TopIntegrationBar }  from './TopIntegrationBar';
import { KPICards }           from './KPICards';
import { IsometricOfficeMap } from './IsometricOfficeMap';
import { RightChatPanel }     from './RightChatPanel';
import { SidebarContent }     from './SidebarContent';
import { useDashboardStore }  from '@/store/dashboardStore';

export function DashboardLayout() {
  const { activeSidebarSection } = useDashboardStore();
  const showMap = activeSidebarSection === 'overview';

  return (
    <div
      className="flex w-screen h-screen overflow-hidden"
      style={{ background: '#020b18', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ── Left sidebar ── */}
      <LeftSidebar />

      {/* ── Main content column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopIntegrationBar />
        <KPICards />

        {/* Swap between map and content panels */}
        {showMap ? (
          <IsometricOfficeMap />
        ) : (
          <div
            className="flex-1 overflow-y-auto"
            style={{ minHeight: 0 }}
          >
            <SidebarContent />
          </div>
        )}
      </div>

      {/* ── Right chat panel — always visible ── */}
      <RightChatPanel />
    </div>
  );
}
