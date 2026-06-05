import { create } from 'zustand';

interface OfficeState {
  activeRoomId: string;
  activeObjectId: string | null;
  isPanelOpen: boolean;
  setRoom: (roomId: string) => void;
  selectObject: (objectId: string | null) => void;
  closePanel: () => void;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  activeRoomId: 'lobby',
  activeObjectId: null,
  isPanelOpen: false,
  setRoom: (roomId) => set({ activeRoomId: roomId, activeObjectId: null, isPanelOpen: false }),
  selectObject: (objectId) => set({ activeObjectId: objectId, isPanelOpen: !!objectId }),
  closePanel: () => set({ isPanelOpen: false, activeObjectId: null }),
}));
