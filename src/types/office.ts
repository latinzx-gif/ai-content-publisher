export interface InteractiveObject {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'board' | 'table' | 'desk' | 'cabinet' | 'screen' | 'radar' | 'vault' | 'map' | 'panel' | 'console' | 'station' | 'queue' | 'shelf' | 'ring' | 'hologram';
  position: [number, number, number];
  color?: string;
  data: Record<string, unknown>;
}

export interface RoomData {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  objects: InteractiveObject[];
}
