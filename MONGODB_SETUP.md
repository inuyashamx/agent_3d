# Configuración de MongoDB

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/agi_3d_mvp
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/agi_3d_mvp

# Nombre de la base de datos (opcional, por defecto: agi_3d_mvp)
DB_NAME=agi_3d_mvp
```

## Opciones de Configuración

### 1. MongoDB Local

```bash
# Instalar MongoDB localmente
# En Ubuntu/Debian:
sudo apt-get install mongodb

# En macOS:
brew install mongodb/brew/mongodb-community

# En Windows:
# Descargar desde https://www.mongodb.com/try/download/community
```

### 2. MongoDB Atlas (Recomendado)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster (gratis hasta 512MB)
4. Configura acceso de red (IP whitelist)
5. Crea usuario de base de datos
6. Obtén la connection string

### 3. Docker (Desarrollo)

```bash
# Ejecutar MongoDB en Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Connection string:
# MONGODB_URI=mongodb://localhost:27017/agi_3d_mvp
```

## Estructura de Datos

El sistema creará automáticamente las siguientes colecciones:

### `scenes`
```json
{
  "_id": "ObjectId",
  "id": "uuid-string",
  "data": {
    "objects": {...},
    "camera": {...},
    "lights": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "default"
}
```

### `config`
```json
{
  "_id": "ObjectId", 
  "userId": "default",
  "config": {
    "theme": "dark",
    "language": "es",
    "autoSave": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Sistema MongoDB Only

El sistema ahora usa **exclusivamente MongoDB** para persistencia de datos.

### localStorage
- Solo guarda el **ID de la escena actual**
- No guarda datos de escenas ni configuración
- Permite recordar qué escena estaba activa

## Verificar Configuración

El sistema mostrará en consola:
- ✅ "Sistema inicializado: MongoDB only" - Sistema funcionando
- ✅ "Escena actual: [ID]" - Escena activa encontrada
- ⚠️ "No hay escena actual" - Se creará una nueva

## Requisitos

⚠️ **MongoDB es OBLIGATORIO** para el funcionamiento del sistema.
Sin MongoDB configurado, la aplicación no funcionará correctamente. 