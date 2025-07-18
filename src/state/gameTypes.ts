import { z } from 'zod';

// Tipos base para transformaciones
export const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof Vec3Schema>;

export const TransformSchema = z.object({
  position: Vec3Schema,
  rotation: Vec3Schema,
  scale: Vec3Schema,
});
export type Transform = z.infer<typeof TransformSchema>;

// Material Schema
export const MaterialSchema = z.object({
  color: z.string(),
  opacity: z.number().min(0).max(1).default(1),
  metallic: z.number().min(0).max(1).default(0),
  roughness: z.number().min(0).max(1).default(0.5),
  emissive: z.string().default('#000000'),
  texture: z.string().optional(),
});
export type Material = z.infer<typeof MaterialSchema>;

// Geometry Schema
export const GeometrySchema = z.object({
  type: z.enum(['box', 'sphere', 'cylinder', 'plane', 'custom']),
  parameters: z.record(z.any()),
  vertices: z.array(z.number()).optional(),
  faces: z.array(z.number()).optional(),
  normals: z.array(z.number()).optional(),
  uvs: z.array(z.number()).optional(),
});
export type Geometry = z.infer<typeof GeometrySchema>;

// Component Schema (ECS-like)
export const ComponentSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
  enabled: z.boolean().default(true),
});
export type Component = z.infer<typeof ComponentSchema>;

// Asset/Prefab Schema
export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['prefab', 'material', 'texture', 'mesh', 'sound', 'script']),
  data: z.object({
    geometry: GeometrySchema.optional(),
    material: MaterialSchema.optional(),
    components: z.array(ComponentSchema).default([]),
    children: z.array(z.string()).default([]), // Child asset IDs
    bounds: z.object({
      min: Vec3Schema,
      max: Vec3Schema,
      center: Vec3Schema,
      size: Vec3Schema,
    }),
  }),
  
  // Metadata
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  
  // Ownership & Access
  owner: z.object({
    type: z.enum(['user', 'organization']),
    id: z.string(),
  }),
  visibility: z.enum(['private', 'team', 'public']),
  permissions: z.record(z.array(z.enum(['read', 'write', 'delete']))).default({}),
  
  // Collaboration
  collaborators: z.array(z.string()).default([]),
  lastModified: z.object({
    by: z.string(),
    at: z.string(),
  }),
  
  // Versioning
  version: z.number().default(1),
  parentVersion: z.string().optional(),
  
  // Stats
  usage: z.number().default(0), // How many scenes use this asset
  rating: z.number().min(0).max(5).default(0),
  downloads: z.number().default(0),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Asset = z.infer<typeof AssetSchema>;

// Scene Instance Schema
export const SceneInstanceSchema = z.object({
  id: z.string(),
  prefabId: z.string(),
  transform: TransformSchema,
  overrides: z.record(z.any()).default({}), // Override prefab properties
  components: z.array(ComponentSchema).default([]), // Instance-specific components
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  
  // Runtime data (for spawned objects)
  spawned: z.boolean().default(false),
  lifetime: z.number().optional(),
  physics: z.object({
    velocity: Vec3Schema,
    acceleration: Vec3Schema,
    mass: z.number().default(1),
  }).optional(),
});
export type SceneInstance = z.infer<typeof SceneInstanceSchema>;

// Enhanced Scene Schema
export const GameSceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  
  // Team Context
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  owner: z.string(),
  collaborators: z.array(z.string()).default([]),
  
  // Scene Content
  instances: z.record(SceneInstanceSchema).default({}),
  
  // Scene Settings
  lighting: z.object({
    ambient: z.string().default('#404040'),
    directional: z.object({
      color: z.string().default('#ffffff'),
      intensity: z.number().default(1),
      direction: Vec3Schema,
    }),
    shadows: z.boolean().default(true),
  }),
  
  camera: z.object({
    position: Vec3Schema,
    target: Vec3Schema,
    fov: z.number().default(75),
    near: z.number().default(0.1),
    far: z.number().default(1000),
  }),
  
  // Physics
  physics: z.object({
    gravity: Vec3Schema.default([0, -9.81, 0]),
    enabled: z.boolean().default(true),
  }),
  
  // Permissions
  permissions: z.record(z.array(z.enum(['read', 'write', 'delete']))).default({}),
  visibility: z.enum(['private', 'team', 'public']),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  
  // Collaboration
  lastModified: z.object({
    by: z.string(),
    at: z.string(),
  }),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GameScene = z.infer<typeof GameSceneSchema>;

// Organization Schema
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(), // URL-friendly name
  description: z.string().optional(),
  
  // Plan & Limits
  plan: z.enum(['free', 'pro', 'enterprise']),
  settings: z.object({
    maxUsers: z.number().default(5),
    maxAssets: z.number().default(100),
    maxScenes: z.number().default(10),
    maxStorage: z.number().default(1024), // MB
    privateAssets: z.boolean().default(false),
    customBranding: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
  }),
  
  // Billing
  billing: z.object({
    subscription: z.enum(['monthly', 'yearly']),
    nextPayment: z.string(),
    customerId: z.string().optional(),
  }).optional(),
  
  // Branding
  branding: z.object({
    logo: z.string().optional(),
    colors: z.object({
      primary: z.string().default('#3b82f6'),
      secondary: z.string().default('#64748b'),
    }),
  }).optional(),
  
  // Stats
  usage: z.object({
    users: z.number().default(0),
    assets: z.number().default(0),
    scenes: z.number().default(0),
    storage: z.number().default(0), // MB used
  }),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

// Team Member Schema
export const TeamMemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
  
  // Permissions
  permissions: z.object({
    createAssets: z.boolean().default(false),
    editAssets: z.boolean().default(false),
    deleteAssets: z.boolean().default(false),
    createScenes: z.boolean().default(false),
    editScenes: z.boolean().default(false),
    deleteScenes: z.boolean().default(false),
    inviteUsers: z.boolean().default(false),
    removeUsers: z.boolean().default(false),
    manageBilling: z.boolean().default(false),
    manageSettings: z.boolean().default(false),
  }),
  
  // Status
  status: z.enum(['active', 'invited', 'suspended']),
  invitedBy: z.string().optional(),
  
  // Timestamps
  joinedAt: z.string(),
  lastActive: z.string(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Project Schema (for organizing scenes)
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  organizationId: z.string(),
  
  // Settings
  settings: z.object({
    defaultScene: z.string().optional(),
    buildSettings: z.record(z.any()).default({}),
    version: z.string().default('1.0.0'),
  }),
  
  // Collaboration
  owner: z.string(),
  collaborators: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

// Helper functions
export function createDefaultTransform(): Transform {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}

export function createDefaultMaterial(): Material {
  return {
    color: '#ffffff',
    opacity: 1,
    metallic: 0,
    roughness: 0.5,
    emissive: '#000000',
  };
}

export function createDefaultAsset(type: Asset['type'], name: string): Asset {
  const now = new Date().toISOString();
  return {
    id: `asset_${Date.now()}`,
    name,
    type,
    data: {
      geometry: type === 'prefab' ? {
        type: 'box',
        parameters: { width: 1, height: 1, depth: 1 },
      } : undefined,
      material: type === 'prefab' ? createDefaultMaterial() : undefined,
      components: [],
      children: [],
      bounds: {
        min: [-0.5, -0.5, -0.5],
        max: [0.5, 0.5, 0.5],
        center: [0, 0, 0],
        size: [1, 1, 1],
      },
    },
    tags: [],
    owner: {
      type: 'user',
      id: 'default',
    },
    visibility: 'private',
    permissions: {},
    collaborators: [],
    lastModified: {
      by: 'default',
      at: now,
    },
    version: 1,
    usage: 0,
    rating: 0,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultGameScene(name: string): GameScene {
  const now = new Date().toISOString();
  return {
    id: `scene_${Date.now()}`,
    name,
    owner: 'default',
    collaborators: [],
    instances: {},
    lighting: {
      ambient: '#404040',
      directional: {
        color: '#ffffff',
        intensity: 1,
        direction: [0, -1, 0],
      },
      shadows: true,
    },
    camera: {
      position: [0, 0, 5],
      target: [0, 0, 0],
      fov: 75,
      near: 0.1,
      far: 1000,
    },
    physics: {
      gravity: [0, -9.81, 0],
      enabled: true,
    },
    permissions: {},
    visibility: 'private',
    tags: [],
    lastModified: {
      by: 'default',
      at: now,
    },
    createdAt: now,
    updatedAt: now,
  };
} 