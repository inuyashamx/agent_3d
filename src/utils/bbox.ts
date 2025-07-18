import { Vector3, Box3, Mesh } from 'three';
import { Obj3D, Shape, Vec3 } from '../state/types';

// Interfaz para bounding box
export interface BoundingBox {
  min: Vec3;
  max: Vec3;
  center: Vec3;
  size: Vec3;
}

// Calcular bounding box de un objeto 3D basado en sus parámetros
export function calculateBoundingBox(obj: Obj3D): BoundingBox {
  const { shape, params, position, scale } = obj;
  
  let size: Vec3 = [0, 0, 0];
  
  // Calcular tamaño base según la forma
  switch (shape) {
    case 'sphere':
      const radius = (params.radius || 1) * Math.max(scale[0], scale[1], scale[2]);
      size = [radius * 2, radius * 2, radius * 2];
      break;
      
    case 'box':
      size = [
        (params.width || 1) * scale[0],
        (params.height || 1) * scale[1],
        (params.depth || 1) * scale[2]
      ];
      break;
      
    case 'cylinder':
      const radiusTop = (params.radiusTop || 1) * Math.max(scale[0], scale[2]);
      const radiusBottom = (params.radiusBottom || 1) * Math.max(scale[0], scale[2]);
      const maxRadius = Math.max(radiusTop, radiusBottom);
      size = [
        maxRadius * 2,
        (params.height || 2) * scale[1],
        maxRadius * 2
      ];
      break;
      
    case 'capsule':
      const capsuleRadius = (params.radius || 0.5) * Math.max(scale[0], scale[2]);
      const capsuleLength = (params.length || 2) * scale[1];
      size = [
        capsuleRadius * 2,
        capsuleLength + capsuleRadius * 2,
        capsuleRadius * 2
      ];
      break;
      
    case 'plane':
      size = [
        (params.width || 2) * scale[0],
        0.01, // Grosor mínimo para el plano
        (params.height || 2) * scale[2]
      ];
      break;
  }
  
  // Calcular min, max y center
  const halfSize: Vec3 = [size[0] / 2, size[1] / 2, size[2] / 2];
  const min: Vec3 = [
    position[0] - halfSize[0],
    position[1] - halfSize[1],
    position[2] - halfSize[2]
  ];
  const max: Vec3 = [
    position[0] + halfSize[0],
    position[1] + halfSize[1],
    position[2] + halfSize[2]
  ];
  
  return {
    min,
    max,
    center: position,
    size
  };
}

// Calcular bounding box de múltiples objetos
export function calculateCombinedBoundingBox(objects: Obj3D[]): BoundingBox | null {
  if (objects.length === 0) return null;
  
  const boxes = objects.map(calculateBoundingBox);
  
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (const box of boxes) {
    minX = Math.min(minX, box.min[0]);
    minY = Math.min(minY, box.min[1]);
    minZ = Math.min(minZ, box.min[2]);
    maxX = Math.max(maxX, box.max[0]);
    maxY = Math.max(maxY, box.max[1]);
    maxZ = Math.max(maxZ, box.max[2]);
  }
  
  const min: Vec3 = [minX, minY, minZ];
  const max: Vec3 = [maxX, maxY, maxZ];
  const center: Vec3 = [
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  ];
  const size: Vec3 = [maxX - minX, maxY - minY, maxZ - minZ];
  
  return { min, max, center, size };
}

// Calcular posición para colocar un objeto arriba de otro
export function calculatePositionAbove(target: Obj3D, base: Obj3D, gap: number = 0): Vec3 {
  const baseBBox = calculateBoundingBox(base);
  const targetBBox = calculateBoundingBox(target);
  
  // Posición Y: arriba del objeto base + mitad del objeto target + gap
  const newY = baseBBox.max[1] + targetBBox.size[1] / 2 + gap;
  
  // Mantener la misma posición X y Z que el objeto base
  return [base.position[0], newY, base.position[2]];
}

// Calcular posición para colocar un objeto debajo de otro
export function calculatePositionBelow(target: Obj3D, base: Obj3D, gap: number = 0): Vec3 {
  const baseBBox = calculateBoundingBox(base);
  const targetBBox = calculateBoundingBox(target);
  
  // Posición Y: debajo del objeto base - mitad del objeto target - gap
  const newY = baseBBox.min[1] - targetBBox.size[1] / 2 - gap;
  
  return [base.position[0], newY, base.position[2]];
}

// Calcular posición para colocar un objeto al lado de otro
export function calculatePositionBeside(target: Obj3D, base: Obj3D, gap: number = 0, side: 'left' | 'right' = 'right'): Vec3 {
  const baseBBox = calculateBoundingBox(base);
  const targetBBox = calculateBoundingBox(target);
  
  const direction = side === 'right' ? 1 : -1;
  const newX = base.position[0] + direction * (baseBBox.size[0] / 2 + targetBBox.size[0] / 2 + gap);
  
  return [newX, base.position[1], base.position[2]];
}

// Verificar si dos bounding boxes se intersectan
export function boundingBoxesIntersect(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
  return (
    bbox1.min[0] <= bbox2.max[0] && bbox1.max[0] >= bbox2.min[0] &&
    bbox1.min[1] <= bbox2.max[1] && bbox1.max[1] >= bbox2.min[1] &&
    bbox1.min[2] <= bbox2.max[2] && bbox1.max[2] >= bbox2.min[2]
  );
}

// Calcular distancia entre dos objetos
export function calculateDistance(obj1: Obj3D, obj2: Obj3D): number {
  const dx = obj1.position[0] - obj2.position[0];
  const dy = obj1.position[1] - obj2.position[1];
  const dz = obj1.position[2] - obj2.position[2];
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Encontrar el objeto más cercano a una posición
export function findNearestObject(position: Vec3, objects: Obj3D[]): Obj3D | null {
  if (objects.length === 0) return null;
  
  let nearestObject = objects[0];
  let minDistance = Infinity;
  
  for (const obj of objects) {
    const dx = obj.position[0] - position[0];
    const dy = obj.position[1] - position[1];
    const dz = obj.position[2] - position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestObject = obj;
    }
  }
  
  return nearestObject;
}

// Verificar si un punto está dentro de un bounding box
export function isPointInBoundingBox(point: Vec3, bbox: BoundingBox): boolean {
  return (
    point[0] >= bbox.min[0] && point[0] <= bbox.max[0] &&
    point[1] >= bbox.min[1] && point[1] <= bbox.max[1] &&
    point[2] >= bbox.min[2] && point[2] <= bbox.max[2]
  );
}

// Obtener volumen de un bounding box
export function getBoundingBoxVolume(bbox: BoundingBox): number {
  return bbox.size[0] * bbox.size[1] * bbox.size[2];
}

// Obtener área de superficie de un bounding box
export function getBoundingBoxSurfaceArea(bbox: BoundingBox): number {
  const [w, h, d] = bbox.size;
  return 2 * (w * h + w * d + h * d);
}

// Expandir bounding box por un factor
export function expandBoundingBox(bbox: BoundingBox, factor: number): BoundingBox {
  const expansion = bbox.size.map(s => s * (factor - 1) / 2) as Vec3;
  
  return {
    min: [bbox.min[0] - expansion[0], bbox.min[1] - expansion[1], bbox.min[2] - expansion[2]],
    max: [bbox.max[0] + expansion[0], bbox.max[1] + expansion[1], bbox.max[2] + expansion[2]],
    center: bbox.center,
    size: [bbox.size[0] * factor, bbox.size[1] * factor, bbox.size[2] * factor]
  };
} 