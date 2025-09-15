const Joi = require("joi");

/**
 * Middleware de validación genérico
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false, // Mostrar todos los errores
      stripUnknown: true, // Remover campos no definidos
      convert: true, // Convertir tipos automáticamente
    });

    if (error) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Los datos proporcionados no son válidos",
          details: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
          })),
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Reemplazar los datos validados en el request
    req[source] = value;
    next();
  };
};

/**
 * Middleware para validar parámetros de ruta
 */
const validateParams = (schema) => {
  return validate(schema, "params");
};

/**
 * Middleware para validar query parameters
 */
const validateQuery = (schema) => {
  return validate(schema, "query");
};

/**
 * Middleware para validar body del request
 */
const validateBody = (schema) => {
  return validate(schema, "body");
};

/**
 * Función para validar respuesta (útil para testing)
 */
const validateResponse = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new Error(
      `Response validation failed: ${error.details
        .map((d) => d.message)
        .join(", ")}`
    );
  }

  return value;
};

/**
 * Middleware para validar archivos (Multer)
 */
const validateFile = (options = {}) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: "MISSING_FILE",
          message: "Archivo requerido",
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Validar tamaño
    const maxSize =
      options.maxSize || parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760; // 10MB
    if (req.file.size > maxSize) {
      return res.status(413).json({
        error: {
          code: "FILE_TOO_LARGE",
          message: `El archivo es demasiado grande. Tamaño máximo: ${maxSize} bytes`,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Validar tipo de archivo
    const allowedTypes =
      options.allowedTypes ||
      (process.env.UPLOAD_ALLOWED_TYPES || "pdf,jpg,jpeg,png").split(",");
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        error: {
          code: "INVALID_FILE_TYPE",
          message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(
            ", "
          )}`,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  validateBody,
  validateResponse,
  validateFile,
};
