/**
 * Middleware global para manejo de errores
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de validación Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos proporcionados no son válidos',
        details: err.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token de autenticación inválido'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token de autenticación expirado'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Error de base de datos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'El recurso ya existe'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: {
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Referencia inválida en los datos'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Error de archivo demasiado grande (Multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'El archivo es demasiado grande'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Error de tipo de archivo no permitido
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Tipo de archivo no permitido'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Error personalizado con código de estado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code || 'CUSTOM_ERROR',
        message: err.message
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  // Error interno del servidor (por defecto)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = errorHandler;
