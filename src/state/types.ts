import { z } from 'zod';

// Tipos básicos
export type Vec3 = [number, number, number];
export type Shape = 'sphere' | 'box' | 'cylinder' | 'capsule' | 'plane';

// Esquema de validación para Vec3
export const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

// Esquema de validación para Shape
export const ShapeSchema = z.enum(['sphere', 'box', 'cylinder', 'capsule', 'plane']);

// Objeto 3D
export interface Obj3D {
  id: string;
  name: string;
  shape: Shape;
  params: Record<string, any>;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  material: {
    color: string;
    [key: string]: any;
  };
  createdAt: number;
  updatedAt: number;
}

// Esquema de validación para Obj3D
export const Obj3DSchema = z.object({
  id: z.string(),
  name: z.string(),
  shape: ShapeSchema,
  params: z.record(z.any()),
  position: Vec3Schema,
  rotation: Vec3Schema,
  scale: Vec3Schema,
  material: z.object({
    color: z.string(),
  }).and(z.record(z.any())),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Datos de la escena
export interface SceneData {
  version: number;
  units: 'meters' | 'centimeters' | 'millimeters';
  objects: Record<string, Obj3D>;
  lastMention?: string;
  createdAt: number;
  updatedAt: number;
}

// Esquema de validación para SceneData
export const SceneDataSchema = z.object({
  version: z.number(),
  units: z.enum(['meters', 'centimeters', 'millimeters']),
  objects: z.record(Obj3DSchema),
  lastMention: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Comandos disponibles
export interface AddPrimitiveCmd {
  action: 'add_primitive';
  name?: string;
  shape: Shape;
  params?: Record<string, any>;
  position?: Vec3;
  color?: string;
}

export interface SetMaterialCmd {
  action: 'set_material';
  target: string;
  color?: string;
  [key: string]: any;
}

export interface SetPositionCmd {
  action: 'set_position';
  target: string;
  position: Vec3;
}

export interface PlaceAboveCmd {
  action: 'place_above';
  target: string;
  base: string;
  gap?: number;
}

export interface DeleteCmd {
  action: 'delete';
  target: string;
}

export interface AskCmd {
  action: 'ask';
  message: string;
}

export type Command = 
  | AddPrimitiveCmd
  | SetMaterialCmd
  | SetPositionCmd
  | PlaceAboveCmd
  | DeleteCmd
  | AskCmd;

// Esquemas de validación para comandos
export const AddPrimitiveCmdSchema = z.object({
  action: z.literal('add_primitive'),
  name: z.string().optional(),
  shape: ShapeSchema,
  params: z.record(z.any()).optional(),
  position: Vec3Schema.optional(),
  color: z.string().optional(),
});

export const SetMaterialCmdSchema = z.object({
  action: z.literal('set_material'),
  target: z.string(),
  color: z.string().optional(),
}).and(z.record(z.any()));

export const SetPositionCmdSchema = z.object({
  action: z.literal('set_position'),
  target: z.string(),
  position: Vec3Schema,
});

export const PlaceAboveCmdSchema = z.object({
  action: z.literal('place_above'),
  target: z.string(),
  base: z.string(),
  gap: z.number().optional(),
});

export const DeleteCmdSchema = z.object({
  action: z.literal('delete'),
  target: z.string(),
});

export const AskCmdSchema = z.object({
  action: z.literal('ask'),
  message: z.string(),
});

export const CommandSchema = z.union([
  AddPrimitiveCmdSchema,
  SetMaterialCmdSchema,
  SetPositionCmdSchema,
  PlaceAboveCmdSchema,
  DeleteCmdSchema,
  AskCmdSchema,
]);

// Entrada de log del chat
export interface ChatLogEntry {
  id: string;
  timestamp: number;
  userInput: string;
  commands: Command[];
  response: string;
  success: boolean;
  error?: string;
}

// Esquema de validación para ChatLogEntry
export const ChatLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  userInput: z.string(),
  commands: z.array(CommandSchema),
  response: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

// Configuración de la aplicación
export interface AppConfig {
  showBoundingBoxes: boolean;
  showGrid: boolean;
  showAxes: boolean;
  autoSave: boolean;
  language: 'es' | 'en';
}

export const AppConfigSchema = z.object({
  showBoundingBoxes: z.boolean(),
  showGrid: z.boolean(),
  showAxes: z.boolean(),
  autoSave: z.boolean(),
  language: z.enum(['es', 'en']),
});

// Función helper para crear objetos 3D por defecto
export function createDefaultObj3D(shape: Shape, name: string): Obj3D {
  const now = Date.now();
  
  const defaultParams: Record<Shape, Record<string, any>> = {
    sphere: { radius: 1, widthSegments: 32, heightSegments: 16 },
    box: { width: 1, height: 1, depth: 1 },
    cylinder: { radiusTop: 1, radiusBottom: 1, height: 2, radialSegments: 32 },
    capsule: { radius: 0.5, length: 2, capSegments: 4, radialSegments: 16 },
    plane: { width: 2, height: 2, widthSegments: 1, heightSegments: 1 }
  };

  return {
    id: `${shape}_${now}`,
    name,
    shape,
    params: defaultParams[shape],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    material: {
      color: '#4299e1' // Azul por defecto
    },
    createdAt: now,
    updatedAt: now
  };
}

// Función helper para crear escena por defecto
export function createDefaultScene(): SceneData {
  const now = Date.now();
  
  return {
    version: 1,
    units: 'meters',
    objects: {},
    createdAt: now,
    updatedAt: now
  };
} 