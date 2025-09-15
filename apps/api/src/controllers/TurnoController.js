const { v4: uuidv4 } = require('uuid');
const TurnoDAO = require('../dao/TurnoDAO');
const NutricionistaDAO = require('../dao/NutricionistaDAO');

/**
 * Controlador para operaciones con turnos
 */
class TurnoController {
  constructor() {
    this.turnoDAO = new TurnoDAO();
    this.nutricionistaDAO = new NutricionistaDAO();
  }

  /**
   * Crear nuevo turno
   * POST /v1/turnos
   */
  async agendarTurno(req, res, next) {
    try {
      const turnoData = {
        id: uuidv4(),
        pacienteId: req.user.id, // Del middleware de autenticación
        nutricionistaId: req.body.nutricionistaId,
        fecha: req.body.fecha,
        hora: req.body.hora,
        modalidad: req.body.modalidad,
        metodoPago: req.body.metodoPago,
        motivo: req.body.motivo
      };

      // Verificar que el nutricionista existe
      const nutricionista = await this.nutricionistaDAO.findById(turnoData.nutricionistaId);
      if (!nutricionista) {
        return res.status(404).json({
          error: {
            code: 'NUTRITIONIST_NOT_FOUND',
            message: 'Nutricionista no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar disponibilidad
      const disponible = await this.nutricionistaDAO.verificarDisponibilidad(
        turnoData.nutricionistaId,
        turnoData.fecha,
        turnoData.hora
      );

      if (!disponible) {
        return res.status(409).json({
          error: {
            code: 'APPOINTMENT_NOT_AVAILABLE',
            message: 'El horario seleccionado no está disponible'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Crear el turno
      const nuevoTurno = await this.turnoDAO.crearTurno(turnoData);

      // Obtener el turno completo con información relacionada
      const turnoCompleto = await this.turnoDAO.obtenerTurnoCompleto(nuevoTurno.id);

      res.status(201).json({
        data: turnoCompleto,
        message: 'Turno agendado exitosamente. Se ha enviado una confirmación por email.'
      });
    } catch (error) {
      console.error('Error in agendarTurno:', error);
      next(error);
    }
  }

  /**
   * Obtener detalles del turno
   * GET /v1/turnos/:id
   */
  async obtenerTurno(req, res, next) {
    try {
      const { id } = req.params;

      const turno = await this.turnoDAO.obtenerTurnoCompleto(id);

      if (!turno) {
        return res.status(404).json({
          error: {
            code: 'APPOINTMENT_NOT_FOUND',
            message: 'Turno no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que el usuario tiene acceso al turno
      if (turno.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para ver este turno'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.status(200).json({
        data: turno
      });
    } catch (error) {
      console.error('Error in obtenerTurno:', error);
      next(error);
    }
  }

  /**
   * Cancelar turno
   * PATCH /v1/turnos/:id/cancelar
   */
  async cancelarTurno(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo, notificar_nutricionista } = req.body;

      // Verificar que el turno existe y pertenece al usuario
      const turnoExistente = await this.turnoDAO.obtenerTurnoCompleto(id);
      if (!turnoExistente) {
        return res.status(404).json({
          error: {
            code: 'APPOINTMENT_NOT_FOUND',
            message: 'Turno no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (turnoExistente.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para cancelar este turno'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Cancelar el turno
      const turnoCancelado = await this.turnoDAO.cancelarTurno(id, motivo, notificar_nutricionista);

      res.status(200).json({
        data: turnoCancelado,
        message: 'Turno cancelado exitosamente'
      });
    } catch (error) {
      console.error('Error in cancelarTurno:', error);
      if (error.message === 'Turno no encontrado o no puede ser cancelado') {
        return res.status(409).json({
          error: {
            code: 'APPOINTMENT_CANNOT_BE_CANCELLED',
            message: 'El turno no puede ser cancelado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      next(error);
    }
  }

  /**
   * Reprogramar turno
   * PATCH /v1/turnos/:id/reprogramar
   */
  async reprogramarTurno(req, res, next) {
    try {
      const { id } = req.params;
      const { fecha, hora, modalidad } = req.body;

      // Verificar que el turno existe y pertenece al usuario
      const turnoExistente = await this.turnoDAO.obtenerTurnoCompleto(id);
      if (!turnoExistente) {
        return res.status(404).json({
          error: {
            code: 'APPOINTMENT_NOT_FOUND',
            message: 'Turno no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      if (turnoExistente.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para reprogramar este turno'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Reprogramar el turno
      const turnoReprogramado = await this.turnoDAO.reprogramarTurno(
        id,
        fecha,
        hora,
        modalidad
      );

      res.status(200).json({
        data: turnoReprogramado,
        message: 'Turno reprogramado exitosamente'
      });
    } catch (error) {
      console.error('Error in reprogramarTurno:', error);
      if (error.message === 'Turno no encontrado') {
        return res.status(404).json({
          error: {
            code: 'APPOINTMENT_NOT_FOUND',
            message: 'Turno no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      if (error.message === 'El nuevo horario no está disponible') {
        return res.status(409).json({
          error: {
            code: 'NEW_SCHEDULE_NOT_AVAILABLE',
            message: 'El nuevo horario no está disponible'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      next(error);
    }
  }

  /**
   * Obtener próximos turnos del paciente
   * GET /v1/turnos/proximos
   */
  async obtenerProximosTurnos(req, res, next) {
    try {
      const pacienteId = req.user.id;
      const { limit = 5 } = req.query;

      const filtros = {
        estado: ['pendiente', 'confirmado']
      };

      const options = {
        limit: parseInt(limit),
        offset: 0
      };

      const resultado = await this.turnoDAO.obtenerTurnosPaciente(pacienteId, filtros, options);

      res.status(200).json({
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error in obtenerProximosTurnos:', error);
      next(error);
    }
  }

  /**
   * Obtener historial de turnos del paciente
   * GET /v1/turnos/historial
   */
  async obtenerHistorialTurnos(req, res, next) {
    try {
      const pacienteId = req.user.id;
      const { estado, limit = 20, offset = 0 } = req.query;

      const filtros = {};
      if (estado) {
        filtros.estado = Array.isArray(estado) ? estado : [estado];
      }

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const resultado = await this.turnoDAO.obtenerTurnosPaciente(pacienteId, filtros, options);

      res.status(200).json({
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error in obtenerHistorialTurnos:', error);
      next(error);
    }
  }
}

module.exports = TurnoController;
