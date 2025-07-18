# 🎮 Game Engine Architecture

## 📋 Resumen del Sistema

**AGI 3D MVP** ahora es un **verdadero game engine** con arquitectura limpia inspirada en **Blender + Unity**:

- ✅ **Assets/Prefabs** - Objetos 3D reutilizables
- ✅ **Game Scenes** - Niveles/entornos con referencias a assets
- ✅ **Instances** - Referencias a assets en scenes (NO objetos embebidos)
- ✅ **Transformations** - Move, rotate, scale tipo Blender
- ✅ **Team Collaboration** - Organizaciones multi-usuario
- ✅ **MongoDB Only** - Base de datos escalable sin híbridos
- ✅ **APIs RESTful** - Interfaz programática completa
- ✅ **Sistema Unificado** - Sin sistemas legacy, solo game engine

---

## 🏗️ Arquitectura de Datos

### **📦 Assets/Prefabs**
```typescript
// Prefabs reutilizables
{
  "id": "house_basic",
  "name": "Basic House",
  "type": "prefab",
  "data": {
    "geometry": { "type": "box", "parameters": {...} },
    "material": { "color": "#8B4513", "roughness": 0.8 },
    "components": ["collider", "interactive"],
    "bounds": { "min": [-2,-2,-2], "max": [2,2,2] }
  },
  "owner": { "type": "organization", "id": "team_awesome" },
  "visibility": "team",
  "usage": 15, // Cuántas veces se ha usado
  "tags": ["building", "residential"]
}
```

### **🎭 Game Scenes**
```typescript
// Escenas con referencias a assets
{
  "id": "level_001",
  "name": "Forest Level",
  "organizationId": "team_awesome",
  "instances": {
    "house_001": {
      "prefabId": "house_basic",
      "transform": {
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1]
      },
      "overrides": {
        "material.color": "#ff0000"
      }
    }
  },
  "lighting": {...},
  "physics": {...}
}
```

### **👥 Teams/Organizations**
```typescript
// Equipos para colaboración
{
  "id": "team_awesome",
  "name": "Awesome Games Studio",
  "plan": "pro",
  "settings": {
    "maxUsers": 50,
    "maxAssets": 1000,
    "privateAssets": true
  },
  "members": [
    {
      "userId": "john_doe",
      "role": "admin",
      "permissions": {
        "createAssets": true,
        "editAssets": true,
        "inviteUsers": true
      }
    }
  ]
}
```

---

## 🌐 APIs Disponibles

### **📦 Assets Management**
```typescript
// Assets/Prefabs
GET    /api/assets                    // Listar assets
POST   /api/assets                    // Crear asset/prefab
GET    /api/assets/[id]               // Obtener asset
PUT    /api/assets/[id]               // Actualizar asset
DELETE /api/assets/[id]               // Eliminar asset

// Búsqueda avanzada
GET    /api/assets?type=prefab&tags=building&search=house
```

### **🎭 Scene Management**
```typescript
// Game Scenes
GET    /api/game-scenes               // Listar scenes
POST   /api/game-scenes               // Crear scene
GET    /api/game-scenes/[id]          // Obtener scene
PUT    /api/game-scenes/[id]          // Actualizar scene
DELETE /api/game-scenes/[id]          // Eliminar scene
```

### **🎯 Scene Instances**
```typescript
// Instancias de assets en scenes
GET    /api/game-scenes/[sceneId]/instances               // Listar instancias
POST   /api/game-scenes/[sceneId]/instances               // Crear instancia
GET    /api/game-scenes/[sceneId]/instances/[instanceId]  // Obtener instancia
PUT    /api/game-scenes/[sceneId]/instances/[instanceId]  // Actualizar instancia
DELETE /api/game-scenes/[sceneId]/instances/[instanceId]  // Eliminar instancia
```

### **🔧 Transformations (Blender-style)**
```typescript
// Transformaciones tipo Blender
PUT /api/game-scenes/[sceneId]/instances/[instanceId]/transform
{
  "operation": "move" | "rotate" | "scale",
  "delta": [1, 0, 0],           // Movimiento relativo
  "absolute": [5, 2, 0],        // Posición absoluta
  "axis": "x" | "y" | "z",      // Restringir a eje
  "snap": true,                 // Snap to grid
  "gridSize": 0.5
}
```

### **👥 Team Management**
```typescript
// Organizaciones/Equipos
GET    /api/organizations             // Listar organizations
POST   /api/organizations             // Crear organization
GET    /api/organizations/[id]        // Obtener organization
PUT    /api/organizations/[id]        // Actualizar organization

// Miembros del equipo
GET    /api/organizations/[id]/members     // Listar miembros
POST   /api/organizations/[id]/members     // Invitar miembro
PUT    /api/organizations/[id]/members/[userId]  // Cambiar rol
DELETE /api/organizations/[id]/members/[userId]  // Remover miembro
```

---

## 🔄 Flujo de Trabajo

### **1. Crear Assets (Prefabs)**
```typescript
// Crear un prefab de casa
const houseAsset = {
  name: "Basic House",
  type: "prefab",
  data: {
    geometry: { type: "box", parameters: { width: 2, height: 2, depth: 2 } },
    material: { color: "#8B4513", roughness: 0.8 },
    components: ["collider", "interactive"]
  },
  tags: ["building", "residential"]
};

await fetch('/api/assets', {
  method: 'POST',
  body: JSON.stringify(houseAsset)
});
```

### **2. Crear Scene**
```typescript
// Crear una escena de juego
const gameScene = {
  name: "Forest Level",
  description: "A peaceful forest environment",
  lighting: {
    ambient: "#404040",
    directional: { color: "#ffffff", intensity: 1 }
  },
  physics: {
    gravity: [0, -9.81, 0],
    enabled: true
  }
};

await fetch('/api/game-scenes', {
  method: 'POST',
  body: JSON.stringify(gameScene)
});
```

### **3. Instanciar Assets en Scene**
```typescript
// Agregar casa a la escena
await fetch(`/api/scenes/${sceneId}/instances`, {
  method: 'POST',
  body: JSON.stringify({
    prefabId: "house_basic",
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    overrides: {
      "material.color": "#ff0000"  // Casa roja
    }
  })
});
```

### **4. Transformar Objects (Blender-style)**
```typescript
// Mover casa 5 unidades en X
await fetch(`/api/scenes/${sceneId}/instances/${instanceId}/transform`, {
  method: 'PUT',
  body: JSON.stringify({
    operation: "move",
    delta: [5, 0, 0],
    snap: true,
    gridSize: 1.0
  })
});

// Rotar casa 45 grados en Y
await fetch(`/api/scenes/${sceneId}/instances/${instanceId}/transform`, {
  method: 'PUT',
  body: JSON.stringify({
    operation: "rotate",
    delta: [0, 45, 0],
    axis: "y"
  })
});
```

---

## 🏢 Sistema de Equipos

### **📊 Roles y Permisos**
```typescript
// Roles disponibles
const roles = {
  "owner": {
    createAssets: true,
    editAssets: true,
    deleteAssets: true,
    createScenes: true,
    editScenes: true,
    deleteScenes: true,
    inviteUsers: true,
    removeUsers: true,
    manageBilling: true,
    manageSettings: true
  },
  "admin": {
    createAssets: true,
    editAssets: true,
    deleteAssets: true,
    createScenes: true,
    editScenes: true,
    deleteScenes: true,
    inviteUsers: true,
    removeUsers: true,
    manageBilling: false,
    manageSettings: false
  },
  "editor": {
    createAssets: true,
    editAssets: true,
    deleteAssets: false,
    createScenes: true,
    editScenes: true,
    deleteScenes: false,
    inviteUsers: false,
    removeUsers: false,
    manageBilling: false,
    manageSettings: false
  },
  "viewer": {
    createAssets: false,
    editAssets: false,
    deleteAssets: false,
    createScenes: false,
    editScenes: false,
    deleteScenes: false,
    inviteUsers: false,
    removeUsers: false,
    manageBilling: false,
    manageSettings: false
  }
};
```

### **🔐 Niveles de Visibilidad**
```typescript
// Visibilidad de assets y scenes
const visibility = {
  "private": "Solo el creador",
  "team": "Todo el equipo/organización",
  "public": "Todos los usuarios"
};
```

### **💰 Planes de Suscripción**
```typescript
const plans = {
  "free": {
    maxUsers: 5,
    maxAssets: 100,
    maxScenes: 10,
    maxStorage: 1024, // MB
    privateAssets: false,
    customBranding: false
  },
  "pro": {
    maxUsers: 50,
    maxAssets: 1000,
    maxScenes: 100,
    maxStorage: 10240, // MB
    privateAssets: true,
    customBranding: true
  },
  "enterprise": {
    maxUsers: -1, // Unlimited
    maxAssets: -1,
    maxScenes: -1,
    maxStorage: -1,
    privateAssets: true,
    customBranding: true,
    apiAccess: true,
    onPremise: true
  }
};
```

---

## 🎯 Beneficios del Sistema

### **✅ Para Game Development**
- **Reutilización**: Crear una vez, usar en múltiples escenas
- **Colaboración**: Equipos trabajando en el mismo proyecto
- **Escalabilidad**: Arquitectura preparada para millones de objetos
- **Performance**: Referencias vs duplicación de datos

### **✅ Para Equipos**
- **Asset Library**: Biblioteca compartida de recursos
- **Workflow**: Flujo de trabajo como Unity/Blender
- **Permisos**: Control granular de acceso
- **Versioning**: Historial de cambios

### **✅ Para Desarrolladores**
- **APIs RESTful**: Integración con cualquier tecnología
- **TypeScript**: Tipado fuerte en todo el sistema
- **Validación**: Schemas Zod para datos consistentes
- **MongoDB**: Base de datos escalable y flexible

---

## 🚀 Próximos Pasos

### **Implementado ✅**
- [x] Arquitectura Assets/Prefabs limpia
- [x] Sistema de Game Scenes con instancias
- [x] Transformaciones tipo Blender
- [x] APIs RESTful completas
- [x] Sistema de equipos/organizaciones
- [x] MongoDB only integration (sin híbridos)
- [x] Sistema unificado (eliminado legacy)

### **En Desarrollo 🔄**
- [ ] Agente LangChain para comandos complejos
- [ ] Sistema de autenticación (NextAuth.js)
- [ ] Interfaz 3D mejorada
- [ ] Asset marketplace
- [ ] Herramientas de colaboración en tiempo real

### **Futuro 🔮**
- [ ] Editor visual tipo Blender
- [ ] Physics engine integration
- [ ] Animation system
- [ ] Scripting system
- [ ] Asset versioning avanzado
- [ ] Build pipeline para juegos

---

## 🧪 Demo y Testing

### **Páginas de Demo**
- **`/api-test`** - Testing de APIs básicas
- **`/game-engine-demo`** - Demo completo del game engine
- **`/`** - Aplicación principal 3D

### **Comandos Útiles**
```bash
# Iniciar desarrollo
npm run dev

# Probar APIs
open http://localhost:3000/api-test

# Demo del game engine
open http://localhost:3000/game-engine-demo

# Aplicación principal
open http://localhost:3000
```

---

## 📚 Recursos Adicionales

### **Configuración**
- `MONGODB_SETUP.md` - Configuración de MongoDB
- `lib/mongodb.ts` - Conexiones y colecciones
- `src/state/gameTypes.ts` - Tipos TypeScript completos

### **Arquitectura**
- `pages/api/assets/` - APIs de assets
- `pages/api/game-scenes/` - APIs de scenes
- `pages/api/scenes/[sceneId]/instances/` - APIs de instancias
- `pages/api/organizations/` - APIs de equipos (próximamente)

¡El sistema está **listo para escalar** a un verdadero game engine comercial! 🚀 