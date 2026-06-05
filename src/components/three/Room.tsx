'use client';

import { RoomData } from '@/types/office';
import { ClickableObject } from './ClickableObject';
import { Html } from '@react-three/drei';

// Corner glows give each room a unique accent colour so boundaries are felt
const ROOM_ACCENT: Record<string, string> = {
  lobby:      '#0ea5e9',
  executive:  '#06b6d4',
  fastwork:   '#22c55e',
  dataclaw:   '#a855f7',
  investment: '#ef4444',
  agents:     '#3b82f6',
  client:     '#eab308',
};

interface RoomProps {
  data: RoomData;
}

const HALF = 6; // half of 12-unit room side

export function Room({ data }: RoomProps) {
  const accent = ROOM_ACCENT[data.id] ?? '#06b6d4';

  return (
    <group position={data.position}>
      {/* ── Floor base ── */}
      <mesh receiveShadow position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#020617" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* ── Inner tech-glass floor ── */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* ── Fine grid ── */}
      <gridHelper args={[12, 24, accent, '#1e293b']} position={[0, -0.04, 0]} />

      {/* ── Glowing border frame (4 thin edge bars) ── */}
      {([ 
        { pos: [ 0,      0, -HALF] as [number,number,number], rot: [0, 0, 0]                      as [number,number,number], sz: [12, 0.05, 0.05] as [number,number,number] },
        { pos: [ 0,      0,  HALF] as [number,number,number], rot: [0, 0, 0]                      as [number,number,number], sz: [12, 0.05, 0.05] as [number,number,number] },
        { pos: [-HALF,   0,  0]    as [number,number,number], rot: [0, Math.PI / 2, 0]            as [number,number,number], sz: [12, 0.05, 0.05] as [number,number,number] },
        { pos: [ HALF,   0,  0]    as [number,number,number], rot: [0, Math.PI / 2, 0]            as [number,number,number], sz: [12, 0.05, 0.05] as [number,number,number] },
      ] as { pos: [number,number,number]; rot: [number,number,number]; sz: [number,number,number] }[]).map((bar, i) => (
        <mesh key={i} position={bar.pos} rotation={bar.rot}>
          <boxGeometry args={bar.sz} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* ── Room title (HTML — always readable) ── */}
      <Html
        position={[0, 0.3, -5]}
        center
        distanceFactor={20}
        occlude={false}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: accent,
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textShadow: `0 0 12px ${accent}`,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {data.name}
        </div>
      </Html>

      {/* ── Objects ── */}
      {data.objects.map((obj) => (
        <ClickableObject key={obj.id} data={obj} />
      ))}

      {/* ── Room lighting ── */}
      <pointLight position={[0, 6, 0]}   intensity={1.8} distance={22} color="#e0f2fe" />
      <pointLight position={[0, 2, -5]}  intensity={0.6} distance={10} color={accent}  />
    </group>
  );
}
