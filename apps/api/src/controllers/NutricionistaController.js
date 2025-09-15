const NutricionistaDAO = require("../dao/NutricionistaDAO");

/**
 * Controlador para operaciones con nutricionistas
 */
class NutricionistaController {
  constructor() {
    this.nutricionistaDAO = new NutricionistaDAO();
  }

  /**
   * Buscar nutricionistas con filtros
   * GET /v1/nutricionistas
   */
  async buscarNutricionistas(req, res, next) {
    try {
      const filtros = {
        nombre: req.query.nombre,
        especialidad: req.query.especialidad,
        modalidad: req.query.modalidad,
        rating_min: req.query.rating_min,
      };

      const options = {
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
      };

      // Limpiar filtros undefined
      Object.keys(filtros).forEach((key) => {
        if (filtros[key] === undefined) {
          delete filtros[key];
        }
      });

      const resultado = await this.nutricionistaDAO.buscarConFiltros(
        filtros,
        options
      );

      res.status(200).json({
        data: resultado.data,
        pagination: resultado.pagination,
      });
    } catch (error) {
      console.error("Error in buscarNutricionistas:", error);
      next(error);
    }
  }

  /**
   * Obtener perfil completo del nutricionista
   * GET /v1/nutricionistas/:id
   */
  async obtenerPerfilNutricionista(req, res, next) {
    try {
      const { id } = req.params;

      const perfil = await this.nutricionistaDAO.obtenerPerfilCompleto(id);

      if (!perfil) {
        return res.status(404).json({
          error: {
            code: "NUTRITIONIST_NOT_FOUND",
            message: "Nutricionista no encontrado",
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      res.status(200).json({
        data: perfil,
      });
    } catch (error) {
      console.error("Error in obtenerPerfilNutricionista:", error);
      next(error);
    }
  }

  /**
   * Verificar disponibilidad del nutricionista
   * GET /v1/nutricionistas/:id/disponibilidad
   */
  async verificarDisponibilidad(req, res, next) {
    try {
      const { id } = req.params;
      const { fecha, hora } = req.query;

      if (!fecha || !hora) {
        return res.status(400).json({
          error: {
            code: "MISSING_PARAMETERS",
            message: "Fecha y hora son requeridos",
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      const disponible = await this.nutricionistaDAO.verificarDisponibilidad(
        id,
        fecha,
        hora
      );

      res.status(200).json({
        data: {
          nutricionistaId: id,
          fecha,
          hora,
          disponible,
        },
      });
    } catch (error) {
      console.error("Error in verificarDisponibilidad:", error);
      next(error);
    }
  }

  /**
   * Obtener horarios de atención del nutricionista
   * GET /v1/nutricionistas/:id/horarios
   */
  async obtenerHorariosAtencion(req, res, next) {
    try {
      const { id } = req.params;
      const { fecha } = req.query;

      // Verificar que el nutricionista existe
      const nutricionista = await this.nutricionistaDAO.findById(id);
      if (!nutricionista) {
        return res.status(404).json({
          error: {
            code: "NUTRITIONIST_NOT_FOUND",
            message: "Nutricionista no encontrado",
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Obtener horarios de atención
      const horariosQuery = `
        SELECT dia, hora_inicio as horaInicio, hora_fin as horaFin
        FROM horarios_atencion 
        WHERE nutricionista_id = ?
        ORDER BY FIELD(dia, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
      `;

      const horarios = await this.nutricionistaDAO.customQuery(horariosQuery, [
        id,
      ]);

      // Si se especifica una fecha, obtener horarios disponibles
      let horariosDisponibles = null;
      if (fecha) {
        horariosDisponibles = await this.obtenerHorariosDisponiblesFecha(
          id,
          fecha
        );
      }

      res.status(200).json({
        data: {
          nutricionistaId: id,
          horariosAtencion: horarios,
          horariosDisponibles: horariosDisponibles,
        },
      });
    } catch (error) {
      console.error("Error in obtenerHorariosAtencion:", error);
      next(error);
    }
  }

  /**
   * Helper para obtener horarios disponibles en una fecha específica
   */
  async obtenerHorariosDisponiblesFecha(nutricionistaId, fecha) {
    const query = `
      SELECT 
        ha.dia,
        ha.hora_inicio,
        ha.hora_fin,
        CASE 
          WHEN t.id IS NULL THEN 1 
          ELSE 0 
        END as disponible
      FROM horarios_atencion ha
      LEFT JOIN turnos t ON ha.nutricionista_id = t.nutricionista_id 
        AND t.fecha = ? 
        AND TIME(t.hora) BETWEEN TIME(ha.hora_inicio) AND TIME(ha.hora_fin)
        AND t.estado IN ('pendiente', 'confirmado')
      WHERE ha.nutricionista_id = ?
    `;

    try {
      const resultados = await this.nutricionistaDAO.customQuery(query, [
        fecha,
        nutricionistaId,
      ]);
      return resultados;
    } catch (error) {
      console.error("Error getting available hours for date:", error);
      return [];
    }
  }
}

module.exports = NutricionistaController;
