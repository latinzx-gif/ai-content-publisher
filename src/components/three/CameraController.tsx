'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useOfficeStore } from '@/store/officeStore';
import { officeRooms } from '@/data/mockData';
import { getZoomOffset } from './ClickableObject';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export function CameraController() {
  const { activeRoomId, activeObjectId } = useOfficeStore();
  const { camera } = useThree();

  const targetPos    = useRef(new THREE.Vector3(0, 10, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const activeRoom = officeRooms[activeRoomId];
    if (!activeRoom) return;

    if (activeObjectId) {
      const obj = activeRoom.objects.find(o => o.id === activeObjectId);
      if (obj) {
        const worldX = activeRoom.position[0] + obj.position[0];
        const worldY = activeRoom.position[1] + obj.position[1];
        const worldZ = activeRoom.position[2] + obj.position[2];

        // Use per-type offsets so large objects don't get under-zoomed
        const { y: yOff, z: zOff } = getZoomOffset(obj.type);

        // Offset X leftward so the panel doesn't cover the object
        targetPos.current.set(worldX - 2, worldY + yOff, worldZ + zOff);
        targetLookAt.current.set(worldX, worldY, worldZ);
      }
    } else {
      // Overview of the whole room — pull back further for big rooms
      const [rx, ry, rz] = activeRoom.position;
      targetPos.current.set(rx, ry + 9, rz + 11);
      targetLookAt.current.set(rx, ry, rz - 1);
    }
  }, [activeRoomId, activeObjectId]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.05);
    currentLookAt.current.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
