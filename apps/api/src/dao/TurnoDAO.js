const BaseDAO = require("./BaseDAO");

/**
 * DAO para operaciones con turnos
 */
class TurnoDAO extends BaseDAO {
  constructor() {
    super("turnos");
  }

  /**
   * Crear un nuevo turno
   */
  async crearTurno(turnoData) {
    const query = `
      INSERT INTO turnos (
        id, paciente_id, nutricionista_id, fecha, hora, 
        modalidad, estado, metodo_pago, motivo, fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      turnoData.id,
      turnoData.pacienteId,
      turnoData.nutricionistaId,
      turnoData.fecha,
      turnoData.hora,
      turnoData.modalidad,
      turnoData.estado || "pendiente",
      turnoData.metodoPago,
      turnoData.motivo,
    ];

    try {
      const result = await this.customQuery(query, params);

      // Crear vínculo paciente-nutricionista si no existe
      await this.crearVinculoPacienteNutricionista(
        turnoData.pacienteId,
        turnoData.nutricionistaId
      );

      return { id: turnoData.id, ...turnoData };
    } catch (error) {
      console.error("Error creating turno:", error);
      throw error;
    }
  }

  /**
   * Obtener turno con información relacionada
   */
  async obtenerTurnoCompleto(id) {
    const query = `
      SELECT 
        t.*,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        p.email as paciente_email,
        p.telefono as paciente_telefono,
        n.nombre as nutricionista_nombre,
        n.apellido as nutricionista_apellido,
        n.matricula as nutricionista_matricula,
        n.especialidades as nutricionista_especialidades,
        n.modalidad as nutricionista_modalidad,
        n.rating as nutricionista_rating,
        n.foto as nutricionista_foto
      FROM turnos t
      JOIN pacientes p ON t.paciente_id = p.id
      JOIN nutricionistas n ON t.nutricionista_id = n.id
      WHERE t.id = ?
    `;

    try {
      const results = await this.customQuery(query, [id]);
      if (results.length === 0) {
        return null;
      }

      const turno = results[0];
      return this.formatTurno(turno);
    } catch (error) {
      console.error("Error getting turno:", error);
      throw error;
    }
  }

  /**
   * Obtener turnos de un paciente
   */
  async obtenerTurnosPaciente(pacienteId, filtros = {}, options = {}) {
    const { limit = 20, offset = 0 } = options;

    let query = `
      SELECT 
        t.*,
        n.nombre as nutricionista_nombre,
        n.apellido as nutricionista_apellido,
        n.matricula as nutricionista_matricula,
        n.especialidades as nutricionista_especialidades,
        n.modalidad as nutricionista_modalidad,
        n.rating as nutricionista_rating,
        n.foto as nutricionista_foto
      FROM turnos t
      JOIN nutricionistas n ON t.nutricionista_id = n.id
      WHERE t.paciente_id = ?
    `;

    const params = [pacienteId];

    // Aplicar filtros de estado
    if (filtros.estado && filtros.estado.length > 0) {
      const estadoPlaceholders = filtros.estado.map(() => "?").join(",");
      query += ` AND t.estado IN (${estadoPlaceholders})`;
      params.push(...filtros.estado);
    }

    query += ` ORDER BY t.fecha DESC, t.hora DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const results = await this.customQuery(query, params);

      // Obtener total para paginación
      let countQuery = `SELECT COUNT(*) as total FROM turnos t WHERE t.paciente_id = ?`;
      const countParams = [pacienteId];

      if (filtros.estado && filtros.estado.length > 0) {
        const estadoPlaceholders = filtros.estado.map(() => "?").join(",");
        countQuery += ` AND t.estado IN (${estadoPlaceholders})`;
        countParams.push(...filtros.estado);
      }

      const countResult = await this.customQuery(countQuery, countParams);
      const total = countResult[0].total;

      return {
        data: results.map(this.formatTurno),
        pagination: {
          total,
          limit,
          offset,
          hasNext: offset + limit < total,
          hasPrev: offset > 0,
        },
      };
    } catch (error) {
      console.error("Error getting patient turnos:", error);
      throw error;
    }
  }

  /**
   * Cancelar turno
   */
  async cancelarTurno(id, motivo, notificarNutricionista = true) {
    const query = `
      UPDATE turnos 
      SET estado = 'cancelado', motivo_cancelacion = ?, fecha_modificacion = NOW()
      WHERE id = ? AND estado IN ('pendiente', 'confirmado')
    `;

    try {
      const result = await this.customQuery(query, [motivo, id]);

      if (result.affectedRows === 0) {
        throw new Error("Turno no encontrado o no puede ser cancelado");
      }

      // Aquí se podría agregar lógica para notificar al nutricionista
      // si notificarNutricionista es true

      return await this.obtenerTurnoCompleto(id);
    } catch (error) {
      console.error("Error canceling turno:", error);
      throw error;
    }
  }

  /**
   * Reprogramar turno
   */
  async reprogramarTurno(id, nuevaFecha, nuevaHora, nuevaModalidad = null) {
    // Verificar disponibilidad
    const turno = await this.obtenerTurnoCompleto(id);
    if (!turno) {
      throw new Error("Turno no encontrado");
    }

    const disponible = await this.verificarDisponibilidad(
      turno.nutricionistaId,
      nuevaFecha,
      nuevaHora
    );

    if (!disponible) {
      throw new Error("El nuevo horario no está disponible");
    }

    let query = `
      UPDATE turnos 
      SET fecha = ?, hora = ?, fecha_modificacion = NOW()
    `;
    const params = [nuevaFecha, nuevaHora];

    if (nuevaModalidad) {
      query += `, modalidad = ?`;
      params.push(nuevaModalidad);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    try {
      const result = await this.customQuery(query, params);

      if (result.affectedRows === 0) {
        throw new Error("No se pudo reprogramar el turno");
      }

      return await this.obtenerTurnoCompleto(id);
    } catch (error) {
      console.error("Error rescheduling turno:", error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de turno
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
   * Crear vínculo paciente-nutricionista si no existe
   */
  async crearVinculoPacienteNutricionista(pacienteId, nutricionistaId) {
    const checkQuery = `
      SELECT id FROM vinculos_paciente_nutricionista 
      WHERE paciente_id = ? AND nutricionista_id = ? AND activo = 1
    `;

    try {
      const existing = await this.customQuery(checkQuery, [
        pacienteId,
        nutricionistaId,
      ]);

      if (existing.length === 0) {
        const insertQuery = `
          INSERT INTO vinculos_paciente_nutricionista (paciente_id, nutricionista_id, fecha_inicio, activo)
          VALUES (?, ?, NOW(), 1)
        `;
        await this.customQuery(insertQuery, [pacienteId, nutricionistaId]);
      }
    } catch (error) {
      console.error("Error creating patient-nutritionist link:", error);
      // No lanzar error aquí ya que es una operación secundaria
    }
  }

  /**
   * Formatear turno para respuesta
   */
  formatTurno(turno) {
    return {
      id: turno.id,
      pacienteId: turno.paciente_id,
      nutricionistaId: turno.nutricionista_id,
      fecha: turno.fecha,
      hora: turno.hora,
      modalidad: turno.modalidad,
      estado: turno.estado,
      metodoPago: turno.metodo_pago,
      motivo: turno.motivo,
      fechaCreacion: turno.fecha_creacion,
      fechaModificacion: turno.fecha_modificacion,
      paciente: turno.paciente_nombre
        ? {
            id: turno.paciente_id,
            nombre: turno.paciente_nombre,
            apellido: turno.paciente_apellido,
            email: turno.paciente_email,
            telefono: turno.paciente_telefono,
          }
        : undefined,
      nutricionista: turno.nutricionista_nombre
        ? {
            id: turno.nutricionista_id,
            nombre: turno.nutricionista_nombre,
            apellido: turno.nutricionista_apellido,
            matricula: turno.nutricionista_matricula,
            especialidades: JSON.parse(
              turno.nutricionista_especialidades || "[]"
            ),
            modalidad: JSON.parse(turno.nutricionista_modalidad || "[]"),
            rating: parseFloat(turno.nutricionista_rating),
            foto: turno.nutricionista_foto,
          }
        : undefined,
    };
  }
}

module.exports = TurnoDAO;
