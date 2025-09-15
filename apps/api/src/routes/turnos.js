const express = require("express");
const TurnoController = require("../controllers/TurnoController");
const { authMiddleware, requirePaciente } = require("../middleware/auth");
const { validateParams, validateBody } = require("../validators/validator");
const { turnoSchemas } = require("../validators/schemas");

const router = express.Router();
const turnoController = new TurnoController();

/**
 * @swagger
 * /turnos:
 *   post:
 *     summary: Agendar nuevo turno
 *     tags: [Turnos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nutricionistaId:
 *                 type: string
 *                 format: uuid
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               modalidad:
 *                 type: string
 *                 enum: [presencial, virtual, mixta]
 *               metodoPago:
 *                 type: string
 *                 enum: [efectivo, transferencia, tarjeta_credito, tarjeta_debito, mercado_pago]
 *               motivo:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Turno no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  authMiddleware,
  requirePaciente,
  validateBody(turnoSchemas.agendarTurno.body),
  turnoController.agendarTurno.bind(turnoController)
);

/**
 * @swagger
 * /turnos/{id}:
 *   get:
 *     summary: Obtener detalles del turno
 *     tags: [Turnos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del turno
 *     responses:
 *       200:
 *         description: Detalles del turno
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/:id",
  authMiddleware,
  validateParams(turnoSchemas.obtenerTurno.params),
  turnoController.obtenerTurno.bind(turnoController)
);

/**
 * @swagger
 * /turnos/{id}/cancelar:
 *   patch:
 *     summary: Cancelar turno
 *     tags: [Turnos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *               notificar_nutricionista:
 *                 type: boolean
 *                 default: true
 *             required:
 *               - motivo
 *     responses:
 *       200:
 *         description: Turno cancelado exitosamente
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Turno no encontrado
 *       409:
 *         description: Turno no puede ser cancelado
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
  "/:id/cancelar",
  authMiddleware,
  validateParams(turnoSchemas.cancelarTurno.params),
  validateBody(turnoSchemas.cancelarTurno.body),
  turnoController.cancelarTurno.bind(turnoController)
);

/**
 * @swagger
 * /turnos/{id}/reprogramar:
 *   patch:
 *     summary: Reprogramar turno
 *     tags: [Turnos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               modalidad:
 *                 type: string
 *                 enum: [presencial, virtual, mixta]
 *             required:
 *               - fecha
 *               - hora
 *     responses:
 *       200:
 *         description: Turno reprogramado exitosamente
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Turno no encontrado
 *       409:
 *         description: Nuevo horario no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
  "/:id/reprogramar",
  authMiddleware,
  validateParams(turnoSchemas.reprogramarTurno.params),
  validateBody(turnoSchemas.reprogramarTurno.body),
  turnoController.reprogramarTurno.bind(turnoController)
);

/**
 * @swagger
 * /turnos/proximos:
 *   get:
 *     summary: Obtener próximos turnos del paciente autenticado
 *     tags: [Turnos]
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
router.get(
  "/proximos",
  authMiddleware,
  requirePaciente,
  turnoController.obtenerProximosTurnos.bind(turnoController)
);

/**
 * @swagger
 * /turnos/historial:
 *   get:
 *     summary: Obtener historial de turnos del paciente autenticado
 *     tags: [Turnos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         description: Historial de turnos del paciente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/historial",
  authMiddleware,
  requirePaciente,
  turnoController.obtenerHistorialTurnos.bind(turnoController)
);

module.exports = router;
