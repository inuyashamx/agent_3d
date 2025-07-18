# AGI 3D MVP - Blender para IA

Un sandbox 3D interactivo que permite crear y modificar objetos 3D usando comandos en lenguaje natural (español e inglés).

## 🎯 Características

### ✅ Funcionalidades Implementadas

- **Creación de primitivos**: Esfera, cubo, cilindro, cápsula, plano
- **Comandos en lenguaje natural**: Soporte para español e inglés
- **Auto-nombrado**: Genera nombres únicos automáticamente
- **Colores**: Mapeo de nombres de colores a valores hexadecimales
- **Posicionamiento**: Coordenadas absolutas y posicionamiento relativo
- **Eliminación**: Borrar objetos por nombre o referencia
- **Pronombres**: Referencia al último objeto mencionado
- **Persistencia**: Auto-guardado en localStorage
- **Exportación**: Descarga de escena en formato JSON
- **Viewport 3D**: Visualización con controles orbitales
- **Log de comandos**: Historial completo de interacciones

### 🚧 Funcionalidades Futuras (TODO)

- [ ] Integración con LLM para parsing más avanzado
- [ ] Importación de modelos glTF
- [ ] Materiales PBR complejos
- [ ] Herramientas de esculpido
- [ ] Sistema de rigging
- [ ] Sincronización con backend (Firebase)
- [ ] Colaboración en tiempo real

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **3D**: Three.js + React Three Fiber + Drei
- **Estado**: Zustand
- **Validación**: Zod
- **Estilos**: Tailwind CSS
- **Testing**: Vitest
- **Linting**: ESLint + Prettier

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd agi-3d-mvp

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar tests
npm run test

# Linting
npm run lint

# Formateo de código
npm run format
```

## 📖 Guía de Uso

### Comandos Soportados

#### Crear Objetos
```
# Español
crea una pelota
haz un cubo rojo
añade un cilindro llamado torre
genera una esfera azul en x1 y2 z0

# Inglés
create a ball
make a red cube
add a cylinder named tower
generate a blue sphere at x1 y2 z0
```

#### Modificar Color
```
# Español
colorea la pelota de verde
pinta el cubo de rojo
cambia el color del cilindro a azul

# Inglés
color the ball green
paint the cube red
change the cylinder color to blue
```

#### Mover Objetos
```
# Español
mueve la pelota a x2 y1 z0
coloca el cubo en (1, 2, 3)
posiciona la esfera en x0 y5 z-2

# Inglés
move the ball to x2 y1 z0
place the cube at (1, 2, 3)
position the sphere at x0 y5 z-2
```

#### Posicionamiento Relativo
```
# Español
pon la pelota arriba del cubo
coloca el cilindro encima de la mesa
ubica la esfera sobre el plano

# Inglés
put the ball above the cube
place the cylinder on top of the table
position the sphere over the plane
```

#### Eliminar Objetos
```
# Español
borra la pelota
elimina el cubo
quita el cilindro

# Inglés
delete the ball
remove the cube
destroy the cylinder
```

### Formas Disponibles

- **Esfera** (sphere): pelota, bola, esfera, balón
- **Cubo** (box): cubo, caja, bloque, dado
- **Cilindro** (cylinder): cilindro, tubo, poste, columna
- **Cápsula** (capsule): cápsula, píldora, palo, barra
- **Plano** (plane): plano, piso, mesa, superficie

### Colores Soportados

#### Básicos
- Rojo/Red, Verde/Green, Azul/Blue
- Amarillo/Yellow, Naranja/Orange, Morado/Purple
- Rosa/Pink, Negro/Black, Blanco/White, Gris/Gray

#### Variaciones
- Claro/Light, Oscuro/Dark
- Ejemplo: "rojo claro", "light blue"

#### Especiales
- Dorado/Gold, Plateado/Silver, Bronce/Bronze
- Turquesa/Turquoise, Coral/Coral, Lavanda/Lavender

### Controles del Viewport

- **Mouse**: Orbitar cámara
- **Scroll**: Zoom
- **Botón Grid**: Mostrar/ocultar rejilla
- **Botón Bounds**: Mostrar/ocultar bounding boxes
- **Botón Export**: Descargar escena JSON

## 🏗️ Arquitectura

```
src/
├── ai/                    # Sistema de IA y parsing
│   ├── parser.ts         # Parser principal de comandos
│   ├── colorMap.ts       # Mapeo de colores
│   └── vocab.ts          # Vocabulario y sinónimos
├── components/           # Componentes React
│   ├── Viewport.tsx      # Viewport 3D
│   ├── ChatPanel.tsx     # Panel de entrada
│   └── CommandLog.tsx    # Log de comandos
├── state/               # Estado global
│   ├── types.ts         # Tipos y esquemas
│   └── sceneStore.ts    # Store de Zustand
├── utils/               # Utilidades
│   ├── bbox.ts          # Cálculos de bounding box
│   └── id.ts            # Generación de IDs
├── persist.ts           # Persistencia localStorage
├── styles.css           # Estilos globales
├── App.tsx              # Componente principal
└── main.tsx             # Punto de entrada
```

### Flujo de Datos

1. **Input**: Usuario escribe comando en ChatPanel
2. **Parsing**: Sistema de IA interpreta comando
3. **Validación**: Zod valida estructura de comandos
4. **Ejecución**: Comandos se aplican al estado
5. **Render**: Viewport actualiza visualización 3D
6. **Persistencia**: Auto-guardado en localStorage

## 🧪 Testing

### Ejecutar Tests

```bash
npm run test
```

### Estructura de Tests

```
tests/
├── parser.test.ts        # Tests del parser
├── colorMap.test.ts      # Tests de mapeo de colores
├── vocab.test.ts         # Tests de vocabulario
└── store.test.ts         # Tests del store
```

### Ejemplos de Tests

```typescript
describe('Parser', () => {
  it('should parse create sphere command', () => {
    const result = parseCommand('crea una pelota', context);
    expect(result).toEqual([{
      action: 'add_primitive',
      shape: 'sphere'
    }]);
  });
});
```

## 🎨 Personalización

### Agregar Nueva Forma

1. Actualizar tipo `Shape` en `types.ts`
2. Añadir vocabulario en `vocab.ts`
3. Implementar rendering en `Viewport.tsx`
4. Agregar parámetros por defecto en `App.tsx`

### Agregar Nuevo Color

```typescript
// src/ai/colorMap.ts
export const COLOR_MAP_ES = {
  // ... colores existentes
  'turquesa': '#40e0d0',
  'magenta': '#ff00ff'
};
```

### Agregar Nuevo Comando

1. Definir tipo en `types.ts`
2. Implementar parser en `parser.ts`
3. Agregar ejecución en `App.tsx`
4. Actualizar vocabulario en `vocab.ts`

## 📊 Métricas y Estadísticas

### Estadísticas de Escena

```typescript
const stats = useSceneStats();
// {
//   objectCount: 5,
//   shapeCount: { sphere: 2, box: 3 },
//   totalSize: 1024
// }
```

### Almacenamiento

```typescript
const storage = getStorageStats();
// {
//   sceneSize: 512,
//   configSize: 64,
//   totalSize: 576,
//   available: true
// }
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
VITE_APP_TITLE=AGI 3D MVP
VITE_DEFAULT_LANGUAGE=es
VITE_ENABLE_DEBUG=false
```

### Configuración de TypeScript

El proyecto usa configuración estricta de TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 🐛 Resolución de Problemas

### Error: Módulo no encontrado

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: TypeScript no reconoce tipos

```bash
# Verificar configuración de TypeScript
npx tsc --noEmit
```

### Error: Viewport no renderiza

1. Verificar que el navegador soporte WebGL
2. Abrir DevTools y revisar errores de consola
3. Verificar que Three.js esté correctamente instalado

## 📝 Licencia

MIT

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles completos
4. Incluye pasos para reproducir el problema

---

**¡Disfruta creando en 3D con IA! 🎉** 