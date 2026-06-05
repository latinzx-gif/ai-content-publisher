'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { InteractiveObject } from '@/types/office';
import { useOfficeStore } from '@/store/officeStore';

interface ClickableObjectProps {
  data: InteractiveObject;
}

// Per-type camera pull-back distance (how far Z to stand from object center)
const ZOOM_OFFSETS: Partial<Record<string, { y: number; z: number }>> = {
  dashboard: { y: 3,   z: 6   },
  board:     { y: 3,   z: 6   },
  screen:    { y: 2,   z: 5   },
  map:       { y: 2,   z: 5   },
  panel:     { y: 2.5, z: 5   },
  table:     { y: 3,   z: 5   },
  desk:      { y: 2.5, z: 4.5 },
  console:   { y: 2.5, z: 5   },
  ring:      { y: 3,   z: 5   },
  radar:     { y: 3,   z: 5   },
  vault:     { y: 3,   z: 5.5 },
  shelf:     { y: 3,   z: 5   },
  hologram:  { y: 3,   z: 5.5 },
  queue:     { y: 2.5, z: 5   },
  station:   { y: 2.5, z: 5   },
};

export function getZoomOffset(type: string): { y: number; z: number } {
  return ZOOM_OFFSETS[type] ?? { y: 2, z: 4 };
}

export function ClickableObject({ data }: ClickableObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectObject, activeObjectId } = useOfficeStore();

  const isActive   = activeObjectId === data.id;
  const baseColor  = data.color || '#ffffff';

  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle bob
    groupRef.current.position.y =
      data.position[1] +
      Math.sin(state.clock.elapsedTime * 2 + data.position[0]) * 0.05;

    // Rotation
    if (data.type === 'ring' || data.type === 'hologram') {
      groupRef.current.rotation.y += isActive ? 0.025 : 0.006;
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        isActive ? 0.2 : 0,
        0.1
      );
    }
  });

  const geometry = useMemo(() => {
    switch (data.type) {
      case 'dashboard':
      case 'board':
        return <boxGeometry args={[3, 2, 0.1]} />;
      case 'screen':
      case 'map':
        return <boxGeometry args={[2, 1.2, 0.05]} />;
      case 'table':
        return <boxGeometry args={[2, 0.1, 1]} />;
      case 'desk':
        return <boxGeometry args={[1.5, 0.1, 0.8]} />;
      case 'panel':
        return <boxGeometry args={[1.2, 1.8, 0.1]} />;
      case 'console':
        return <boxGeometry args={[1.5, 0.8, 1]} />;
      case 'radar':
      case 'ring':
        return <torusGeometry args={[0.8, 0.07, 16, 64]} />;
      case 'vault':
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      case 'shelf':
        return <boxGeometry args={[1, 2, 0.5]} />;
      case 'hologram':
        return <cylinderGeometry args={[0.5, 0.5, 1.5, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [data.type]);

  const meshRotation = useMemo<[number, number, number]>(() => {
    if (data.type === 'ring' || data.type === 'radar') return [Math.PI / 2, 0, 0];
    if (data.type === 'console') return [-Math.PI / 6, 0, 0];
    return [0, 0, 0];
  }, [data.type]);

  // Label floats above the mesh bounding box
  const labelY = useMemo(() => {
    switch (data.type) {
      case 'table': case 'desk': return 0.6;
      case 'ring':  case 'radar': return 1.2;
      case 'board': case 'dashboard': return 1.4;
      case 'shelf': return 1.4;
      default: return 1.2;
    }
  }, [data.type]);

  return (
    <group position={data.position} ref={groupRef}>
      <mesh
        ref={meshRef}
        rotation={meshRotation}
        onClick={(e) => { e.stopPropagation(); selectObject(data.id); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {geometry}
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={
            isActive ? 0.9 : hovered ? 0.55 :
            (data.type === 'hologram' || data.type === 'ring' ? 0.6 : 0.2)
          }
          transparent
          opacity={data.type === 'hologram' ? 0.45 : 0.85}
          roughness={0.1}
          metalness={0.8}
        />
        {isActive && (
          <mesh scale={1.06}>
            {geometry}
            <meshBasicMaterial color={baseColor} wireframe transparent opacity={0.55} />
          </mesh>
        )}
      </mesh>

      {/* HTML label — always faces camera, readable at any angle */}
      <Html
        position={[0, labelY, 0]}
        center
        distanceFactor={12}
        occlude={false}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(2,6,23,0.75)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${baseColor}55`,
            borderRadius: '6px',
            padding: '3px 10px',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            boxShadow: `0 0 8px ${baseColor}44`,
            userSelect: 'none',
          }}
        >
          {data.name}
        </div>
      </Html>
    </group>
  );
}
