'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { dynamic3DRooms } from '@/data/officeDashboard';
import { Room } from './Room';
import { CameraController } from './CameraController';
import { useOfficeStore } from '@/store/officeStore';

export function OfficeScene() {
  const { closePanel } = useOfficeStore();

  return (
    <div className="w-full h-full absolute inset-0 bg-[#020617]">
      <Canvas 
        shadows 
        camera={{ position: [0, 10, 10], fov: 50 }}
        onPointerMissed={closePanel}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#020617']} />
          <fog attach="fog" args={['#020617', 10, 50]} />
          
          <ambientLight intensity={0.2} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="night" />
          
          {dynamic3DRooms.map((room) => (
            <Room key={room.id} data={room} />
          ))}

          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}

