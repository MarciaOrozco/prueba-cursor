# Nutrito API - CORE 1

API backend para la plataforma Nutrito desarrollada con Node.js y Express, siguiendo el contrato OpenAPI 3.1.

## 🚀 Características

- **Arquitectura de 3 capas**: Presentación, Negocio y Datos
- **Autenticación JWT** con middleware de seguridad
- **Validación robusta** de requests y responses con Joi
- **DAO pattern** para acceso a datos con MySQL
- **Documentación automática** con Swagger UI
- **Manejo de errores centralizado**
- **Upload de archivos** con validación
- **Rate limiting** y seguridad HTTP

## 📋 Requisitos

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm o yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
cd apps/api
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nutrito_db
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu-secret-jwt-muy-seguro
```

3. **Crear base de datos:**
```sql
CREATE DATABASE nutrito_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Ejecutar migraciones** (cuando estén disponibles)

5. **Iniciar servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación interactiva estará disponible en:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🏗️ Estructura del Proyecto

```
src/
├── app.js                 # Aplicación principal
├── config/
│   └── database.js       # Configuración de base de datos
├── controllers/          # Controladores por recurso
│   ├── NutricionistaController.js
│   ├── TurnoController.js
│   ├── DocumentoController.js
│   └── PacienteController.js
├── dao/                  # Data Access Objects
│   ├── BaseDAO.js
│   ├── NutricionistaDAO.js
│   ├── TurnoDAO.js
│   ├── DocumentoDAO.js
│   └── PacienteDAO.js
├── middleware/           # Middleware personalizado
│   ├── auth.js          # Autenticación JWT
│   └── errorHandler.js  # Manejo de errores
├── routes/              # Rutas Express
│   ├── nutricionistas.js
│   ├── turnos.js
│   ├── documentos.js
│   └── pacientes.js
├── validators/          # Validación con Joi
│   ├── schemas.js       # Esquemas de validación
│   └── validator.js     # Middleware de validación
└── utils/               # Utilidades
```

## 🔐 Autenticación

La API utiliza JWT para autenticación. Incluye el token en el header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Endpoints Principales

### Nutricionistas
- `GET /v1/nutricionistas` - Buscar nutricionistas con filtros
- `GET /v1/nutricionistas/:id` - Perfil completo del nutricionista
- `GET /v1/nutricionistas/:id/disponibilidad` - Verificar disponibilidad

### Turnos
- `POST /v1/turnos` - Agendar nuevo turno
- `GET /v1/turnos/:id` - Obtener detalles del turno
- `PATCH /v1/turnos/:id/cancelar` - Cancelar turno
- `PATCH /v1/turnos/:id/reprogramar` - Reprogramar turno

### Documentos
- `POST /v1/turnos/:id/documentos` - Adjuntar documento
- `GET /v1/turnos/:id/documentos` - Obtener documentos del turno
- `GET /v1/documentos/:id/descargar` - Descargar documento

### Pacientes
- `GET /v1/pacientes/:id/turnos` - Turnos del paciente
- `GET /v1/pacientes/mi-perfil` - Mi perfil
- `PATCH /v1/pacientes/:id` - Actualizar perfil

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm test` - Ejecutar tests
- `npm run lint` - Linter
- `npm run lint:fix` - Corregir errores de linting

## 📝 Logs

Los logs se muestran en consola con el formato:
```
[timestamp] method url status responseTime
```

## 🚨 Manejo de Errores

La API devuelve errores en formato estándar:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": [...]
  },
  "timestamp": "2024-01-20T15:30:00Z",
  "path": "/v1/endpoint"
}
```

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **CORS**: Configurado para dominios específicos
- **JWT**: Tokens con expiración
- **Validación**: Todos los inputs son validados

## 📁 Uploads

Los archivos se almacenan en `/uploads/` con:
- Tamaño máximo: 10MB
- Tipos permitidos: PDF, JPG, JPEG, PNG
- Nombres únicos generados con UUID

## 🗄️ Base de Datos

El proyecto utiliza MySQL con:
- Pool de conexiones
- Transacciones
- Queries preparadas
- Manejo de errores robusto

## 🚀 Próximos Pasos

1. Implementar migraciones de base de datos
2. Agregar tests unitarios y de integración
3. Implementar notificaciones por email
4. Integrar con servicios de calendario
5. Agregar logging estructurado
6. Implementar cache con Redis
7. Configurar CI/CD

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
