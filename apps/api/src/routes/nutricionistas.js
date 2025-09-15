const express = require('express');
const multer = require('multer');
const NutricionistaController = require('../controllers/NutricionistaController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validateParams, validateQuery } = require('../validators/validator');
const { nutricionistaSchemas } = require('../validators/schemas');

const router = express.Router();
const nutricionistaController = new NutricionistaController();

// Configuración de multer para uploads (si es necesario en el futuro)
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760 // 10MB
  }
});

/**
 * @swagger
 * /nutricionistas:
 *   get:
 *     summary: Buscar nutricionistas
 *     tags: [Nutricionistas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del nutricionista
 *       - in: query
 *         name: especialidad
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filtrar por especialidad
 *       - in: query
 *         name: modalidad
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filtrar por modalidad de atención
 *       - in: query
 *         name: rating_min
 *         schema:
 *           type: number
 *         description: Rating mínimo del nutricionista
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de resultados a omitir para paginación
 *     responses:
 *       200:
 *         description: Lista de nutricionistas encontrados
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/',
  authMiddleware,
  validateQuery(nutricionistaSchemas.buscarNutricionistas.query),
  nutricionistaController.buscarNutricionistas.bind(nutricionistaController)
);

/**
 * @swagger
 * /nutricionistas/{id}:
 *   get:
 *     summary: Obtener perfil detallado del nutricionista
 *     tags: [Nutricionistas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del nutricionista
 *     responses:
 *       200:
 *         description: Perfil completo del nutricionista
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Nutricionista no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id',
  authMiddleware,
  validateParams(nutricionistaSchemas.obtenerPerfilNutricionista.params),
  nutricionistaController.obtenerPerfilNutricionista.bind(nutricionistaController)
);

/**
 * @swagger
 * /nutricionistas/{id}/disponibilidad:
 *   get:
 *     summary: Verificar disponibilidad del nutricionista
 *     tags: [Nutricionistas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del nutricionista
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha a verificar
 *       - in: query
 *         name: hora
 *         required: true
 *         schema:
 *           type: string
 *           format: time
 *         description: Hora a verificar
 *     responses:
 *       200:
 *         description: Disponibilidad del nutricionista
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/disponibilidad',
  authMiddleware,
  validateParams(nutricionistaSchemas.obtenerPerfilNutricionista.params),
  nutricionistaController.verificarDisponibilidad.bind(nutricionistaController)
);

/**
 * @swagger
 * /nutricionistas/{id}/horarios:
 *   get:
 *     summary: Obtener horarios de atención del nutricionista
 *     tags: [Nutricionistas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del nutricionista
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica para ver horarios disponibles
 *     responses:
 *       200:
 *         description: Horarios de atención del nutricionista
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Nutricionista no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/horarios',
  authMiddleware,
  validateParams(nutricionistaSchemas.obtenerPerfilNutricionista.params),
  nutricionistaController.obtenerHorariosAtencion.bind(nutricionistaController)
);

module.exports = router;
