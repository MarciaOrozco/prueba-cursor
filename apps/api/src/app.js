const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
require('dotenv').config();

// Importar middleware personalizado
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Importar rutas
const nutricionistasRoutes = require('./routes/nutricionistas');
const turnosRoutes = require('./routes/turnos');
const documentosRoutes = require('./routes/documentos');
const pacientesRoutes = require('./routes/pacientes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite por IP
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware global
app.use(helmet()); // Seguridad HTTP
app.use(compression()); // Compresión gzip
app.use(limiter); // Rate limiting
app.use(morgan('combined')); // Logging HTTP
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));

// Parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos para uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuración de Swagger UI
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi-core1.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Nutrito API - CORE 1'
  }));
  console.log('📚 Documentación API disponible en: http://localhost:' + PORT + '/api-docs');
} catch (error) {
  console.warn('⚠️  No se pudo cargar la documentación Swagger:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use('/v1/nutricionistas', nutricionistasRoutes);
app.use('/v1/turnos', turnosRoutes);
app.use('/v1/documentos', documentosRoutes);
app.use('/v1/pacientes', pacientesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Nutrito API - CORE 1',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint no encontrado'
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Middleware global de manejo de errores
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const { testConnection } = require('./config/database');
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor Nutrito API ejecutándose en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📖 Documentación: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = app;
