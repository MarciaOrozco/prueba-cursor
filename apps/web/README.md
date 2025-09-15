# Nutrito Web - Frontend

Frontend de la plataforma Nutrito desarrollado con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Características

- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Cliente API generado automáticamente** desde OpenAPI 3.1
- **Autenticación JWT** con manejo de estado
- **Responsive Design** optimizado para móviles
- **Componentes reutilizables** y modulares

## 📋 Requisitos

- Node.js >= 18.0.0
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

```bash
cp env.local.example .env.local
```

Editar `.env.local` con tu configuración:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

3. **Generar tipos TypeScript desde OpenAPI:**

```bash
npm run generate-api
```

4. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3001

## 📚 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo en puerto 3001
- `npm run build` - Construir para producción
- `npm run start` - Iniciar servidor de producción en puerto 3001
- `npm run lint` - Ejecutar ESLint
- `npm run generate-api` - Generar tipos TypeScript desde OpenAPI
- `npm run type-check` - Verificar tipos TypeScript

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Página de inicio
│   ├── login/             # Página de login
│   ├── perfil/            # Página de perfil
│   ├── nutricionistas/    # Páginas de nutricionistas
│   │   ├── page.tsx       # Lista de nutricionistas
│   │   └── [id]/          # Perfil de nutricionista
│   └── turnos/            # Páginas de turnos
├── components/            # Componentes reutilizables
│   ├── Layout.tsx         # Layout principal
│   ├── NutricionistaCard.tsx
│   └── TurnoCard.tsx
└── lib/                   # Utilidades y configuración
    ├── api/               # Cliente API
    │   ├── client.ts      # Cliente HTTP
    │   └── types.ts       # Tipos generados desde OpenAPI
    └── auth.ts            # Manejo de autenticación
```

## 🔐 Autenticación

La aplicación maneja la autenticación JWT con:

- **Almacenamiento local** del token
- **Manejo de estado** centralizado
- **Protección de rutas** automática
- **Logout** con limpieza de datos

### Credenciales de Demo

- **Email:** demo@nutrito.com
- **Contraseña:** demo123

## 📊 Páginas Implementadas

### 🏠 Página de Inicio (`/`)

- Hero section con call-to-action
- Características principales
- Enlaces a funcionalidades clave

### 🔍 Buscar Nutricionistas (`/nutricionistas`)

- Lista paginada de nutricionistas
- Filtros por especialidad, modalidad y rating
- Búsqueda por nombre
- Cards informativos con rating y especialidades

### 👨‍⚕️ Perfil de Nutricionista (`/nutricionistas/[id]`)

- Información completa del profesional
- Formación académica
- Horarios de atención
- Reseñas de pacientes
- Modal para agendar consulta

### 📅 Mis Turnos (`/turnos`)

- Pestañas para "Próximos" e "Historial"
- Lista de turnos con información detallada
- Acciones de cancelar y reprogramar
- Paginación para historial

### 👤 Mi Perfil (`/perfil`)

- Información personal editable
- Estadísticas de uso
- Acciones rápidas
- Gestión de datos

### 🔑 Login (`/login`)

- Formulario de autenticación
- Credenciales de demo
- Redirección automática

## 🎨 Componentes

### Layout

- Header con navegación
- Footer
- Manejo de autenticación
- Responsive design

### NutricionistaCard

- Información resumida del profesional
- Rating con estrellas
- Especialidades y modalidades
- Botón de acción

### TurnoCard

- Información del turno
- Estado visual
- Acciones contextuales
- Información del nutricionista

## 🔌 Cliente API

El cliente API está generado automáticamente desde el contrato OpenAPI:

```typescript
import { apiClient } from "@/lib/api/client";

// Buscar nutricionistas
const nutricionistas = await apiClient.buscarNutricionistas({
  especialidad: ["nutricion_clinica"],
  modalidad: ["presencial"],
});

// Agendar turno
const turno = await apiClient.agendarTurno({
  nutricionistaId: "uuid",
  fecha: "2024-03-15",
  hora: "14:30",
  modalidad: "virtual",
  metodoPago: "mercado_pago",
});
```

## 🎨 Estilos

### Tailwind CSS

- **Sistema de diseño** consistente
- **Responsive utilities** para móviles
- **Componentes** predefinidos
- **Dark mode** ready

### Colores

- **Primary:** Blue (600)
- **Success:** Green (600)
- **Warning:** Yellow (400)
- **Error:** Red (600)

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints:** sm, md, lg, xl
- **Grid system** flexible
- **Typography** escalable

## 🔧 Configuración

### Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NODE_ENV=development
```

### TypeScript

- **Strict mode** habilitado
- **Path mapping** configurado
- **ESLint** integrado

## 🚀 Despliegue

### Build para Producción

```bash
npm run build
npm run start
```

### Variables de Entorno en Producción

```env
NEXT_PUBLIC_API_URL=https://api.nutrito.com/v1
NODE_ENV=production
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Coverage
npm run test:coverage
```

## 📈 Performance

- **Image optimization** automática
- **Code splitting** por rutas
- **Lazy loading** de componentes
- **Bundle analysis** disponible

## 🔒 Seguridad

- **XSS protection** con sanitización
- **CSRF protection** con tokens
- **Secure headers** configurados
- **JWT validation** en cliente

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [OpenAPI Generator](https://openapi-generator.tech/)
