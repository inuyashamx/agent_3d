import React from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import { useGameSceneStore } from '../state/gameSceneStore';
import { ObjectSelector } from './ObjectSelector';

// Componente principal del viewport
export function Viewport({ selectedInstanceId, onSelectInstance }: { selectedInstanceId: string | null; onSelectInstance: (id: string) => void }) {
  const scene = useGameSceneStore(state => state.scene);
  const assets = useGameSceneStore(state => state.assets);
  const config = useGameSceneStore(state => state.config);

  const handleBackgroundClick = () => {
    onSelectInstance(''); // Deseleccionar cuando se hace clic en el fondo
  };

  return (
    <>
      {/* Controles de órbita */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        enableDamping={true}
      />

      {/* Luces */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Grid (solo si está habilitado) */}
      {config.showGrid && (
        <Grid 
          args={[20, 20]} 
          position={[0, -0.01, 0]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#444444" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#666666" 
        />
      )}

      {/* Ejes (solo si está habilitado) */}
      {config.showAxes && (
        <group>
          {/* Eje X - Rojo */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, 3, 0, 0])}
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
                array={new Float32Array([0, 0, 0, 0, 3, 0])}
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
                array={new Float32Array([0, 0, 0, 0, 0, 3])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#0000ff" />
          </line>
        </group>
      )}

      {/* Renderizar instancias */}
      {Object.entries(scene.instances).map(([id, instance]) => {
        const asset = assets[instance.prefabId];
        if (!asset) return null;
        
        return (
          <ObjectSelector
            key={id}
            instanceId={id}
            assetId={instance.prefabId}
            transform={instance.transform}
            isSelected={selectedInstanceId === id}
            onSelect={onSelectInstance}
          />
        );
      })}

      {/* Plano invisible para el suelo (para sombras y clicks) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        onClick={handleBackgroundClick}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d2d2d" transparent opacity={0.1} />
      </mesh>
    </>
  );
} 