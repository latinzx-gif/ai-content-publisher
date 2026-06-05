'use client';

import { useOfficeStore } from '@/store/officeStore';
import { roomList } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Compass } from 'lucide-react';

export function RoomNavigator() {
  const { activeRoomId, setRoom } = useOfficeStore();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 w-full max-w-4xl px-4 pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium text-white/80 pointer-events-auto">
        <Compass className="w-4 h-4" />
        <span>Command Navigation</span>
      </div>
      
      <div className="flex items-center justify-center gap-2 flex-wrap bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl w-full pointer-events-auto shadow-2xl">
        {roomList.map((room) => (
          <button
            key={room.id}
            onClick={() => setRoom(room.id)}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              activeRoomId === room.id 
                ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
}
