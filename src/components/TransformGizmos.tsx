import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameSceneStore, useGameSceneActions } from '../state/gameSceneStore';
import { TransformMode } from './TransformToolbar';
import { Vec3 } from '../state/gameTypes';
import * as THREE from 'three';

interface TransformGizmosProps {
  selectedInstanceId: string | null;
  mode: TransformMode;
  onTransform?: (type: 'move' | 'rotate' | 'scale', value: Vec3) => void;
}

export function TransformGizmos({ selectedInstanceId, mode, onTransform }: TransformGizmosProps) {
  const scene = useGameSceneStore(state => state.scene);
  const { updateInstance } = useGameSceneActions();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<THREE.Vector3 | null>(null);
  const [dragAxis, setDragAxis] = useState<'x' | 'y' | 'z' | null>(null);

  const selectedInstance = selectedInstanceId ? scene.instances[selectedInstanceId] : null;
  
  if (!selectedInstance || mode === 'select') return null;

  const position = selectedInstance.transform.position;
  const rotation = selectedInstance.transform.rotation;
  const scale = selectedInstance.transform.scale;

  const handleGizmoPointerDown = (event: ThreeEvent<PointerEvent>, axis: 'x' | 'y' | 'z') => {
    event.stopPropagation();
    setIsDragging(true);
    setDragAxis(axis);
    setDragStart(new THREE.Vector3().copy(event.point));
  };

  const handleGizmoPointerUp = () => {
    setIsDragging(false);
    setDragAxis(null);
    setDragStart(null);
  };

  const handleTransformDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !dragStart || !dragAxis || !selectedInstanceId) return;

    const currentPoint = new THREE.Vector3().copy(event.point);
    const delta = currentPoint.sub(dragStart);

    let newTransform = [...selectedInstance.transform.position] as Vec3;
    
    if (mode === 'move') {
      const axisIndex = dragAxis === 'x' ? 0 : dragAxis === 'y' ? 1 : 2;
      newTransform[axisIndex] = position[axisIndex] + delta.getComponent(axisIndex);
      
      updateInstance(selectedInstanceId, {
        transform: {
          ...selectedInstance.transform,
          position: newTransform
        }
      });
    }
    
    if (onTransform) {
      onTransform(mode, newTransform);
    }
  };

  const renderMoveGizmo = () => (
    <group position={position}>
      {/* Eje X - Rojo */}
      <group>
        <mesh
          position={[0.5, 0, 0]}
          onPointerDown={(e) => handleGizmoPointerDown(e, 'x')}
          onPointerMove={handleTransformDrag}
          onPointerUp={handleGizmoPointerUp}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </group>

      {/* Eje Y - Verde */}
      <group>
        <mesh
          position={[0, 0.5, 0]}
          onPointerDown={(e) => handleGizmoPointerDown(e, 'y')}
          onPointerMove={handleTransformDrag}
          onPointerUp={handleGizmoPointerUp}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      </group>

      {/* Eje Z - Azul */}
      <group>
        <mesh
          position={[0, 0, 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerDown={(e) => handleGizmoPointerDown(e, 'z')}
          onPointerMove={handleTransformDrag}
          onPointerUp={handleGizmoPointerUp}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
        <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
      </group>

      {/* Centro */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );

  const renderRotateGizmo = () => (
    <group position={position}>
      {/* Anillo X - Rojo */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1, 0.02, 8, 32]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Anillo Y - Verde */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.02, 8, 32]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Anillo Z - Azul */}
      <mesh>
        <torusGeometry args={[1, 0.02, 8, 32]} />
        <meshBasicMaterial color="#0000ff" />
      </mesh>
    </group>
  );

  const renderScaleGizmo = () => (
    <group position={position}>
      {/* Eje X - Rojo */}
      <group>
        <mesh position={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </group>

      {/* Eje Y - Verde */}
      <group>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      </group>

      {/* Eje Z - Azul */}
      <group>
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
        <mesh position={[0, 0, 1.2]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
      </group>

      {/* Centro - Escala uniforme */}
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );

  switch (mode) {
    case 'move':
      return renderMoveGizmo();
    case 'rotate':
      return renderRotateGizmo();
    case 'scale':
      return renderScaleGizmo();
    default:
      return null;
  }
} 