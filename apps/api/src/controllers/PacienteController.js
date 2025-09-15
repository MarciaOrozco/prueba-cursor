const PacienteDAO = require('../dao/PacienteDAO');
const TurnoDAO = require('../dao/TurnoDAO');

/**
 * Controlador para operaciones con pacientes
 */
class PacienteController {
  constructor() {
    this.pacienteDAO = new PacienteDAO();
    this.turnoDAO = new TurnoDAO();
  }

  /**
   * Obtener turnos del paciente
   * GET /v1/pacientes/:id/turnos
   */
  async obtenerTurnosPaciente(req, res, next) {
    try {
      const { id } = req.params;
      const { estado, limit = 20, offset = 0 } = req.query;

      // Verificar permisos - solo el propio paciente o admin puede ver sus turnos
      if (req.user.id !== id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para ver los turnos de este paciente'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que el paciente existe
      const paciente = await this.pacienteDAO.obtenerPaciente(id);
      if (!paciente) {
        return res.status(404).json({
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Paciente no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const filtros = {};
      if (estado) {
        filtros.estado = Array.isArray(estado) ? estado : [estado];
      }

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const resultado = await this.turnoDAO.obtenerTurnosPaciente(id, filtros, options);

      res.status(200).json({
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error in obtenerTurnosPaciente:', error);
      next(error);
    }
  }

  /**
   * Obtener perfil del paciente
   * GET /v1/pacientes/:id
   */
  async obtenerPerfilPaciente(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar permisos
      if (req.user.id !== id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para ver el perfil de este paciente'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const paciente = await this.pacienteDAO.obtenerPaciente(id);
      if (!paciente) {
        return res.status(404).json({
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Paciente no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.status(200).json({
        data: paciente
      });
    } catch (error) {
      console.error('Error in obtenerPerfilPaciente:', error);
      next(error);
    }
  }

  /**
   * Obtener nutricionistas vinculados al paciente
   * GET /v1/pacientes/:id/nutricionistas
   */
  async obtenerNutricionistasVinculados(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar permisos
      if (req.user.id !== id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para ver los nutricionistas vinculados de este paciente'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const nutricionistas = await this.pacienteDAO.obtenerNutricionistasVinculados(id);

      res.status(200).json({
        data: nutricionistas
      });
    } catch (error) {
      console.error('Error in obtenerNutricionistasVinculados:', error);
      next(error);
    }
  }

  /**
   * Obtener resumen de actividad del paciente
   * GET /v1/pacientes/:id/resumen
   */
  async obtenerResumenActividad(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar permisos
      if (req.user.id !== id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para ver el resumen de actividad de este paciente'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const resumen = await this.pacienteDAO.obtenerResumenActividad(id);

      res.status(200).json({
        data: resumen
      });
    } catch (error) {
      console.error('Error in obtenerResumenActividad:', error);
      next(error);
    }
  }

  /**
   * Actualizar perfil del paciente
   * PATCH /v1/pacientes/:id
   */
  async actualizarPerfilPaciente(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar permisos
      if (req.user.id !== id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para actualizar el perfil de este paciente'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que el paciente existe
      const paciente = await this.pacienteDAO.obtenerPaciente(id);
      if (!paciente) {
        return res.status(404).json({
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Paciente no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Si se está actualizando el email, verificar que no exista
      if (updateData.email && updateData.email !== paciente.email) {
        const emailExiste = await this.pacienteDAO.verificarEmailExistente(updateData.email, id);
        if (emailExiste) {
          return res.status(409).json({
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'El email ya está en uso por otro paciente'
            },
            timestamp: new Date().toISOString(),
            path: req.path
          });
        }
      }

      const actualizado = await this.pacienteDAO.actualizarPerfil(id, updateData);

      if (!actualizado) {
        return res.status(400).json({
          error: {
            code: 'UPDATE_FAILED',
            message: 'No se pudo actualizar el perfil'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Obtener el perfil actualizado
      const perfilActualizado = await this.pacienteDAO.obtenerPaciente(id);

      res.status(200).json({
        data: perfilActualizado,
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error in actualizarPerfilPaciente:', error);
      next(error);
    }
  }

  /**
   * Obtener mi perfil (usuario autenticado)
   * GET /v1/pacientes/mi-perfil
   */
  async obtenerMiPerfil(req, res, next) {
    try {
      const paciente = await this.pacienteDAO.obtenerPaciente(req.user.id);
      
      if (!paciente) {
        return res.status(404).json({
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Paciente no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.status(200).json({
        data: paciente
      });
    } catch (error) {
      console.error('Error in obtenerMiPerfil:', error);
      next(error);
    }
  }

  /**
   * Obtener mis próximos turnos (usuario autenticado)
   * GET /v1/pacientes/mis-turnos/proximos
   */
  async obtenerMisProximosTurnos(req, res, next) {
    try {
      const { limit = 5 } = req.query;

      const filtros = {
        estado: ['pendiente', 'confirmado']
      };

      const options = {
        limit: parseInt(limit),
        offset: 0
      };

      const resultado = await this.turnoDAO.obtenerTurnosPaciente(req.user.id, filtros, options);

      res.status(200).json({
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error in obtenerMisProximosTurnos:', error);
      next(error);
    }
  }
}

module.exports = PacienteController;
