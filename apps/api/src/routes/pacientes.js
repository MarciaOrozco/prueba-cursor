const express = require('express');
const PacienteController = require('../controllers/PacienteController');
const { authMiddleware, requirePaciente } = require('../middleware/auth');
const { validateParams, validateQuery, validateBody } = require('../validators/validator');
const { pacienteSchemas } = require('../validators/schemas');

const router = express.Router();
const pacienteController = new PacienteController();

// Esquema para actualización de perfil
const actualizarPerfilSchema = {
  body: require('joi').object({
    nombre: require('joi').string().optional(),
    apellido: require('joi').string().optional(),
    telefono: require('joi').string().optional()
  })
};

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Obtener perfil del paciente
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del paciente
 *     responses:
 *       200:
 *         description: Perfil del paciente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id',
  authMiddleware,
  validateParams(pacienteSchemas.obtenerTurnosPaciente.params),
  pacienteController.obtenerPerfilPaciente.bind(pacienteController)
);

/**
 * @swagger
 * /pacientes/{id}:
 *   patch:
 *     summary: Actualizar perfil del paciente
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 *       409:
 *         description: Email ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id',
  authMiddleware,
  validateParams(pacienteSchemas.obtenerTurnosPaciente.params),
  validateBody(actualizarPerfilSchema.body),
  pacienteController.actualizarPerfilPaciente.bind(pacienteController)
);

/**
 * @swagger
 * /pacientes/{id}/turnos:
 *   get:
 *     summary: Obtener turnos del paciente
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del paciente
 *       - in: query
 *         name: estado
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [pendiente, confirmado, cancelado, completado, reprogramado]
 *         description: Filtrar por estado del turno
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de turnos a obtener
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de turnos a omitir para paginación
 *     responses:
 *       200:
 *         description: Lista de turnos del paciente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/turnos',
  authMiddleware,
  validateParams(pacienteSchemas.obtenerTurnosPaciente.params),
  validateQuery(pacienteSchemas.obtenerTurnosPaciente.query),
  pacienteController.obtenerTurnosPaciente.bind(pacienteController)
);

/**
 * @swagger
 * /pacientes/{id}/nutricionistas:
 *   get:
 *     summary: Obtener nutricionistas vinculados al paciente
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del paciente
 *     responses:
 *       200:
 *         description: Lista de nutricionistas vinculados
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/nutricionistas',
  authMiddleware,
  validateParams(pacienteSchemas.obtenerTurnosPaciente.params),
  pacienteController.obtenerNutricionistasVinculados.bind(pacienteController)
);

/**
 * @swagger
 * /pacientes/{id}/resumen:
 *   get:
 *     summary: Obtener resumen de actividad del paciente
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del paciente
 *     responses:
 *       200:
 *         description: Resumen de actividad del paciente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/resumen',
  authMiddleware,
  validateParams(pacienteSchemas.obtenerTurnosPaciente.params),
  pacienteController.obtenerResumenActividad.bind(pacienteController)
);

/**
 * @swagger
 * /pacientes/mi-perfil:
 *   get:
 *     summary: Obtener mi perfil (paciente autenticado)
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del paciente autenticado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/mi-perfil',
  authMiddleware,
  requirePaciente,
  pacienteController.obtenerMiPerfil.bind(pacienteController)
);

/**
 * @swagger
 * /pacientes/mis-turnos/proximos:
 *   get:
 *     summary: Obtener próximos turnos del paciente autenticado
 *     tags: [Pacientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Número máximo de turnos a obtener
 *     responses:
 *       200:
 *         description: Próximos turnos del paciente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/mis-turnos/proximos',
  authMiddleware,
  requirePaciente,
  pacienteController.obtenerMisProximosTurnos.bind(pacienteController)
);

module.exports = router;
