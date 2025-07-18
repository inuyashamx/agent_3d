import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Sphere, Cylinder, Plane } from '@react-three/drei';
import { useObjects, useConfig } from '../state/sceneStore';
import { Obj3D } from '../state/types';
import * as THREE from 'three';

// Componente para renderizar un objeto 3D individual
function Object3D({ obj }: { obj: Obj3D }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Actualizar posición, rotación y escala
      meshRef.current.position.set(...obj.position);
      meshRef.current.rotation.set(...obj.rotation);
      meshRef.current.scale.set(...obj.scale);
    }
  });

  const renderGeometry = () => {
    const commonProps = {
      ref: meshRef,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
    };

    const material = (
      <meshStandardMaterial
        color={obj.material.color}
        roughness={0.5}
        metalness={0.2}
      />
    );

    switch (obj.shape) {
      case 'sphere':
        return (
          <Sphere
            {...commonProps}
            args={[
              obj.params.radius || 1,
              obj.params.widthSegments || 32,
              obj.params.heightSegments || 16,
            ]}
          >
            {material}
          </Sphere>
        );

      case 'box':
        return (
          <Box
            {...commonProps}
            args={[
              obj.params.width || 1,
              obj.params.height || 1,
              obj.params.depth || 1,
            ]}
          >
            {material}
          </Box>
        );

      case 'cylinder':
        return (
          <Cylinder
            {...commonProps}
            args={[
              obj.params.radiusTop || 1,
              obj.params.radiusBottom || 1,
              obj.params.height || 2,
              obj.params.radialSegments || 32,
            ]}
          >
            {material}
          </Cylinder>
        );

      case 'capsule':
        // Drei no tiene Capsule built-in, usaremos una combinación
        return (
          <group {...commonProps}>
            <Cylinder
              args={[
                obj.params.radius || 0.5,
                obj.params.radius || 0.5,
                obj.params.length || 2,
                obj.params.radialSegments || 16,
              ]}
            >
              {material}
            </Cylinder>
            <Sphere
              position={[0, (obj.params.length || 2) / 2, 0]}
              args={[obj.params.radius || 0.5]}
            >
              {material}
            </Sphere>
            <Sphere
              position={[0, -(obj.params.length || 2) / 2, 0]}
              args={[obj.params.radius || 0.5]}
            >
              {material}
            </Sphere>
          </group>
        );

      case 'plane':
        return (
          <Plane
            {...commonProps}
            args={[
              obj.params.width || 2,
              obj.params.height || 2,
              obj.params.widthSegments || 1,
              obj.params.heightSegments || 1,
            ]}
          >
            {material}
          </Plane>
        );

      default:
        return null;
    }
  };

  return (
    <group>
      {renderGeometry()}
      {/* Nombre del objeto flotante */}
      <mesh position={[obj.position[0], obj.position[1] + 1.5, obj.position[2]]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Componente para mostrar bounding boxes
function BoundingBox({ obj }: { obj: Obj3D }) {
  const config = useConfig();
  
  if (!config.showBoundingBoxes) return null;

  // Cálculo simplificado de bounding box
  const size = getObjectSize(obj);
  
  return (
    <group position={obj.position}>
      <Box args={size}>
        <meshBasicMaterial
          color="#ffff00"
          wireframe
          transparent
          opacity={0.3}
        />
      </Box>
    </group>
  );
}

// Función helper para obtener el tamaño de un objeto
function getObjectSize(obj: Obj3D): [number, number, number] {
  switch (obj.shape) {
    case 'sphere':
      const radius = obj.params.radius || 1;
      return [radius * 2, radius * 2, radius * 2];
    case 'box':
      return [
        obj.params.width || 1,
        obj.params.height || 1,
        obj.params.depth || 1
      ];
    case 'cylinder':
      const maxRadius = Math.max(obj.params.radiusTop || 1, obj.params.radiusBottom || 1);
      return [maxRadius * 2, obj.params.height || 2, maxRadius * 2];
    case 'capsule':
      const capsuleRadius = obj.params.radius || 0.5;
      return [
        capsuleRadius * 2,
        (obj.params.length || 2) + capsuleRadius * 2,
        capsuleRadius * 2
      ];
    case 'plane':
      return [obj.params.width || 2, 0.01, obj.params.height || 2];
    default:
      return [1, 1, 1];
  }
}

// Componente principal del viewport
export function Viewport() {
  const objects = useObjects();
  const config = useConfig();

  return (
    <>
      {/* Controles de órbita */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={2}
        maxDistance={50}
      />

      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -10]} color="#ffffff" intensity={0.5} />

      {/* Grid del suelo */}
      {config.showGrid && (
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9ca3af"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}

      {/* Ejes de coordenadas */}
      {config.showAxes && (
        <group>
          {/* Eje X - Rojo */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 5, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff0000" />
          </line>
          
          {/* Eje Y - Verde */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 0, 5, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ff00" />
          </line>
          
          {/* Eje Z - Azul */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 0, 0, 5])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#0000ff" />
          </line>
        </group>
      )}

      {/* Renderizar todos los objetos */}
      {Object.values(objects).map((obj) => (
        <group key={obj.id}>
          <Object3D obj={obj} />
          <BoundingBox obj={obj} />
        </group>
      ))}

      {/* Plano invisible para el suelo (para sombras) */}
      <mesh
        receiveShadow
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#1a1a1a"
          transparent
          opacity={0.1}
        />
      </mesh>
    </>
  );
} 