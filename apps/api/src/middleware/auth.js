const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token de autenticación requerido'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Extraer token
    const token = authHeader.substring(7); // Remover 'Bearer '

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Formato de token inválido'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo || 'paciente' // paciente, nutricionista, admin
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token de autenticación inválido'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token de autenticación expirado'
        },
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Error de autenticación'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        tipo: decoded.tipo || 'paciente'
      };
    }
    
    next();
  } catch (error) {
    // En autenticación opcional, continuamos sin usuario
    next();
  }
};

/**
 * Middleware para verificar que el usuario es un paciente
 */
const requirePaciente = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Autenticación requerida'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (req.user.tipo !== 'paciente') {
    return res.status(403).json({
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Se requieren permisos de paciente'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es un nutricionista
 */
const requireNutricionista = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Autenticación requerida'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (req.user.tipo !== 'nutricionista') {
    return res.status(403).json({
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Se requieren permisos de nutricionista'
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  next();
};

/**
 * Función para generar token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requirePaciente,
  requireNutricionista,
  generateToken
};
