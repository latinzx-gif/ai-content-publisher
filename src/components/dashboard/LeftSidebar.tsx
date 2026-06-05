'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  GitBranch,
  BookOpen,
  BarChart3,
  Settings,
  Building2,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Office Overview', Icon: LayoutDashboard },
  { id: 'chat',      label: 'Chat Center',      Icon: MessageSquare  },
  { id: 'agents',    label: 'Agents',           Icon: Bot            },
  { id: 'workflow',  label: 'Workflow Board',   Icon: GitBranch      },
  { id: 'sops',      label: 'Skills / SOP',    Icon: BookOpen       },
  { id: 'reports',   label: 'Reports',          Icon: BarChart3      },
  { id: 'settings',  label: 'Settings',         Icon: Settings       },
] as const;

export function LeftSidebar() {
  const { activeSidebarSection, setActiveSidebarSection } = useDashboardStore();

  return (
    <aside
      className="flex flex-col shrink-0 h-full select-none z-10"
      style={{
        width: '64px',
        background: 'rgba(3, 10, 25, 0.95)',
        borderRight: '1px solid rgba(6,182,212,0.12)',
      }}
    >
      {/* Logo mark */}
      <div className="flex items-center justify-center h-14 shrink-0" style={{ borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', color: '#020617' }}
        >
          HO
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 p-2 pt-3">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeSidebarSection === id;
          return (
            <div key={id} className="relative group">
              <button
                onClick={() => setActiveSidebarSection(id)}
                className="w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(6,182,212,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                  color: isActive ? '#06b6d4' : 'rgba(255,255,255,0.35)',
                  boxShadow: isActive ? '0 0 12px rgba(6,182,212,0.15)' : 'none',
                }}
              >
                <Icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
              </button>

              {/* Tooltip */}
              <div
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                style={{
                  background: 'rgba(3,10,25,0.95)',
                  border: '1px solid rgba(6,182,212,0.25)',
                  color: '#e2e8f0',
                }}
              >
                {label}
              </div>

              {/* Active indicator bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', left: '-8px' }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Workspace switcher at bottom */}
      <div className="p-2 pb-3 shrink-0" style={{ borderTop: '1px solid rgba(6,182,212,0.1)' }}>
        <div className="relative group">
          <button
            className="w-full flex items-center justify-center p-2 rounded-xl transition-all"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <Building2 style={{ width: '18px', height: '18px' }} />
          </button>
          <div
            className="pointer-events-none absolute left-full bottom-0 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
            style={{
              background: 'rgba(3,10,25,0.95)',
              border: '1px solid rgba(6,182,212,0.25)',
              color: '#e2e8f0',
            }}
          >
            Switch Workspace
            <ChevronRight className="inline ml-1 w-3 h-3 opacity-60" />
          </div>
        </div>
      </div>
    </aside>
  );
}
