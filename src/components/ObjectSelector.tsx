import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGameSceneStore } from '../state/gameSceneStore';
import * as THREE from 'three';

interface ObjectSelectorProps {
  instanceId: string;
  assetId: string;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  isSelected: boolean;
  onSelect: (instanceId: string) => void;
}

export function ObjectSelector({ instanceId, assetId, transform, isSelected, onSelect }: ObjectSelectorProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const assets = useGameSceneStore(state => state.assets);
  const [hovered, setHovered] = useState(false);
  
  const asset = assets[assetId];
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...transform.position);
      meshRef.current.rotation.set(...transform.rotation);
      meshRef.current.scale.set(...transform.scale);
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(instanceId);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  if (!asset) return null;

  // Determinar el color basado en el estado
  const getColor = () => {
    if (isSelected) return '#4f46e5'; // Azul para seleccionado
    if (hovered) return '#10b981'; // Verde para hover
    return asset.data.material?.color || '#888888'; // Color original
  };

  // Renderizar geometría según el tipo
  const renderGeometry = () => {
    const geometryType = asset.data.geometry?.type || 'box';
    const params = asset.data.geometry?.parameters || {};
    
    switch (geometryType) {
      case 'sphere':
        return <sphereGeometry args={[params.radius || 0.5, params.widthSegments || 32, params.heightSegments || 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[params.radiusTop || 0.5, params.radiusBottom || 0.5, params.height || 1, params.radialSegments || 32]} />;
      case 'plane':
        return <planeGeometry args={[params.width || 1, params.height || 1]} />;
      case 'box':
      default:
        return <boxGeometry args={[params.width || 1, params.height || 1, params.depth || 1]} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        position={transform.position}
        rotation={transform.rotation}
        scale={transform.scale}
      >
        {renderGeometry()}
        <meshStandardMaterial 
          color={getColor()}
          opacity={asset.data.material?.opacity || 1}
          transparent={asset.data.material?.opacity !== undefined && asset.data.material.opacity < 1}
          metalness={asset.data.material?.metallic || 0}
          roughness={asset.data.material?.roughness || 0.5}
          emissive={asset.data.material?.emissive || '#000000'}
        />
      </mesh>
      
      {/* Bounding box para objeto seleccionado */}
      {isSelected && (
        <mesh position={transform.position} rotation={transform.rotation} scale={transform.scale}>
          {renderGeometry()}
          <meshBasicMaterial 
            color="#4f46e5" 
            wireframe 
            opacity={0.3} 
            transparent 
          />
        </mesh>
      )}
    </group>
  );
} 