import { create } from 'zustand';

export type ViewMode = 'dashboard' | '3d-scene';

interface DashboardState {
  viewMode: ViewMode;
  selectedAgentId: string;
  selectedRoomId: string;
  activeSidebarSection: string;
  chatInput: string;

  setViewMode: (mode: ViewMode) => void;
  selectAgent: (agentId: string, roomId: string) => void;
  setActiveSidebarSection: (section: string) => void;
  setChatInput: (value: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  viewMode: 'dashboard',
  selectedAgentId: 'hermes',
  selectedRoomId: 'hermes-ops',
  activeSidebarSection: 'overview',
  chatInput: '',

  setViewMode: (mode) => set({ viewMode: mode }),
  selectAgent: (agentId, roomId) => set({ selectedAgentId: agentId, selectedRoomId: roomId }),
  setActiveSidebarSection: (section) => set({ activeSidebarSection: section }),
  setChatInput: (value) => set({ chatInput: value }),
}));
