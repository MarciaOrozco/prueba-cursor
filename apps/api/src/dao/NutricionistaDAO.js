const BaseDAO = require("./BaseDAO");

/**
 * DAO para operaciones con nutricionistas
 */
class NutricionistaDAO extends BaseDAO {
  constructor() {
    super("nutricionistas");
  }

  /**
   * Buscar nutricionistas con filtros
   */
  async buscarConFiltros(filtros = {}, options = {}) {
    const { limit = 20, offset = 0 } = options;
    let query = `
      SELECT 
        n.id,
        n.nombre,
        n.apellido,
        n.matricula,
        n.especialidades,
        n.modalidad,
        n.rating,
        n.total_resenas as totalResenas,
        n.foto,
        n.fecha_registro,
        n.activo
      FROM nutricionistas n
      WHERE n.activo = 1
    `;

    const params = [];

    // Aplicar filtros
    if (filtros.nombre) {
      query += ` AND (n.nombre LIKE ? OR n.apellido LIKE ?)`;
      const nombrePattern = `%${filtros.nombre}%`;
      params.push(nombrePattern, nombrePattern);
    }

    if (filtros.especialidad && filtros.especialidad.length > 0) {
      const especialidadPlaceholders = filtros.especialidad
        .map(() => "?")
        .join(",");
      query += ` AND JSON_CONTAINS(n.especialidades, ?)`;
      params.push(`"${filtros.especialidad[0]}"`); // Simplificado para una especialidad
    }

    if (filtros.modalidad && filtros.modalidad.length > 0) {
      const modalidadPlaceholders = filtros.modalidad.map(() => "?").join(",");
      query += ` AND JSON_CONTAINS(n.modalidad, ?)`;
      params.push(`"${filtros.modalidad[0]}"`); // Simplificado para una modalidad
    }

    if (filtros.rating_min) {
      query += ` AND n.rating >= ?`;
      params.push(filtros.rating_min);
    }

    query += ` ORDER BY n.rating DESC, n.total_resenas DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const results = await this.customQuery(query, params);

      // Obtener total para paginación
      let countQuery = `SELECT COUNT(*) as total FROM nutricionistas n WHERE n.activo = 1`;
      const countParams = [];

      if (filtros.nombre) {
        countQuery += ` AND (n.nombre LIKE ? OR n.apellido LIKE ?)`;
        const nombrePattern = `%${filtros.nombre}%`;
        countParams.push(nombrePattern, nombrePattern);
      }

      if (filtros.especialidad && filtros.especialidad.length > 0) {
        countQuery += ` AND JSON_CONTAINS(n.especialidades, ?)`;
        countParams.push(`"${filtros.especialidad[0]}"`);
      }

      if (filtros.modalidad && filtros.modalidad.length > 0) {
        countQuery += ` AND JSON_CONTAINS(n.modalidad, ?)`;
        countParams.push(`"${filtros.modalidad[0]}"`);
      }

      if (filtros.rating_min) {
        countQuery += ` AND n.rating >= ?`;
        countParams.push(filtros.rating_min);
      }

      const countResult = await this.customQuery(countQuery, countParams);
      const total = countResult[0].total;

      return {
        data: results.map(this.formatNutricionistaResumen),
        pagination: {
          total,
          limit,
          offset,
          hasNext: offset + limit < total,
          hasPrev: offset > 0,
        },
      };
    } catch (error) {
      console.error("Error searching nutritionists:", error);
      throw error;
    }
  }

  /**
   * Obtener perfil completo del nutricionista
   */
  async obtenerPerfilCompleto(id) {
    const query = `
      SELECT 
        n.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'titulo', f.titulo,
            'institucion', f.institucion,
            'año', f.año
          )
        ) as formacion
      FROM nutricionistas n
      LEFT JOIN formacion f ON n.id = f.nutricionista_id
      WHERE n.id = ? AND n.activo = 1
      GROUP BY n.id
    `;

    try {
      const results = await this.customQuery(query, [id]);
      if (results.length === 0) {
        return null;
      }

      const nutricionista = results[0];

      // Obtener horarios de atención
      const horariosQuery = `
        SELECT dia, hora_inicio as horaInicio, hora_fin as horaFin
        FROM horarios_atencion 
        WHERE nutricionista_id = ?
      `;
      const horarios = await this.customQuery(horariosQuery, [id]);

      // Obtener reseñas recientes
      const reseñasQuery = `
        SELECT 
          r.id,
          CONCAT(SUBSTRING(p.nombre, 1, 1), '. ', p.apellido) as pacienteNombre,
          r.rating,
          r.comentario,
          r.fecha
        FROM reseñas r
        JOIN pacientes p ON r.paciente_id = p.id
        WHERE r.nutricionista_id = ?
        ORDER BY r.fecha DESC
        LIMIT 10
      `;
      const reseñas = await this.customQuery(reseñasQuery, [id]);

      return {
        ...this.formatNutricionista(nutricionista),
        formacion: nutricionista.formacion || [],
        horariosAtencion: horarios,
        reseñas: reseñas,
      };
    } catch (error) {
      console.error("Error getting nutritionist profile:", error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad del nutricionista en fecha y hora
   */
  async verificarDisponibilidad(nutricionistaId, fecha, hora) {
    const query = `
      SELECT COUNT(*) as count
      FROM turnos
      WHERE nutricionista_id = ? 
        AND fecha = ? 
        AND hora = ? 
        AND estado IN ('pendiente', 'confirmado')
    `;

    try {
      const result = await this.customQuery(query, [
        nutricionistaId,
        fecha,
        hora,
      ]);
      return result[0].count === 0;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw error;
    }
  }

  /**
   * Formatear nutricionista para respuesta resumida
   */
  formatNutricionistaResumen(nutricionista) {
    return {
      id: nutricionista.id,
      nombre: nutricionista.nombre,
      apellido: nutricionista.apellido,
      matricula: nutricionista.matricula,
      especialidades: JSON.parse(nutricionista.especialidades || "[]"),
      modalidad: JSON.parse(nutricionista.modalidad || "[]"),
      rating: parseFloat(nutricionista.rating),
      totalResenas: nutricionista.totalResenas,
      foto: nutricionista.foto,
    };
  }

  /**
   * Formatear nutricionista para respuesta completa
   */
  formatNutricionista(nutricionista) {
    return {
      id: nutricionista.id,
      nombre: nutricionista.nombre,
      apellido: nutricionista.apellido,
      matricula: nutricionista.matricula,
      especialidades: JSON.parse(nutricionista.especialidades || "[]"),
      modalidad: JSON.parse(nutricionista.modalidad || "[]"),
      rating: parseFloat(nutricionista.rating),
      totalResenas: nutricionista.total_resenas,
      foto: nutricionista.foto,
      experiencia: nutricionista.experiencia,
      descripcion: nutricionista.descripcion,
    };
  }
}

module.exports = NutricionistaDAO;
