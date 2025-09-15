const BaseDAO = require('./BaseDAO');

/**
 * DAO para operaciones con pacientes
 */
class PacienteDAO extends BaseDAO {
  constructor() {
    super('pacientes');
  }

  /**
   * Obtener paciente por ID
   */
  async obtenerPaciente(id) {
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT t.id) as total_turnos,
        COUNT(DISTINCT v.id) as nutricionistas_vinculados
      FROM pacientes p
      LEFT JOIN turnos t ON p.id = t.paciente_id
      LEFT JOIN vinculos_paciente_nutricionista v ON p.id = v.paciente_id AND v.activo = 1
      WHERE p.id = ? AND p.activo = 1
      GROUP BY p.id
    `;

    try {
      const results = await this.customQuery(query, [id]);
      if (results.length === 0) {
        return null;
      }

      const paciente = results[0];
      return this.formatPaciente(paciente);
    } catch (error) {
      console.error('Error getting paciente:', error);
      throw error;
    }
  }

  /**
   * Obtener paciente por email
   */
  async obtenerPacientePorEmail(email) {
    const query = `
      SELECT * FROM pacientes 
      WHERE email = ? AND activo = 1
    `;

    try {
      const results = await this.customQuery(query, [email]);
      return results.length > 0 ? this.formatPaciente(results[0]) : null;
    } catch (error) {
      console.error('Error getting paciente by email:', error);
      throw error;
    }
  }

  /**
   * Obtener nutricionistas vinculados al paciente
   */
  async obtenerNutricionistasVinculados(pacienteId) {
    const query = `
      SELECT 
        v.*,
        n.nombre,
        n.apellido,
        n.matricula,
        n.especialidades,
        n.modalidad,
        n.rating,
        n.foto
      FROM vinculos_paciente_nutricionista v
      JOIN nutricionistas n ON v.nutricionista_id = n.id
      WHERE v.paciente_id = ? AND v.activo = 1
      ORDER BY v.fecha_inicio DESC
    `;

    try {
      const results = await this.customQuery(query, [pacienteId]);
      return results.map(v => ({
        id: v.nutricionista_id,
        nombre: v.nombre,
        apellido: v.apellido,
        matricula: v.matricula,
        especialidades: JSON.parse(v.especialidades || '[]'),
        modalidad: JSON.parse(v.modalidad || '[]'),
        rating: parseFloat(v.rating),
        foto: v.foto,
        fechaVinculacion: v.fecha_inicio
      }));
    } catch (error) {
      console.error('Error getting linked nutritionists:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de actividad del paciente
   */
  async obtenerResumenActividad(pacienteId) {
    const query = `
      SELECT 
        COUNT(CASE WHEN t.estado = 'pendiente' THEN 1 END) as turnos_pendientes,
        COUNT(CASE WHEN t.estado = 'confirmado' THEN 1 END) as turnos_confirmados,
        COUNT(CASE WHEN t.estado = 'completado' THEN 1 END) as turnos_completados,
        COUNT(CASE WHEN t.estado = 'cancelado' THEN 1 END) as turnos_cancelados,
        COUNT(DISTINCT d.id) as documentos_totales,
        COUNT(DISTINCT v.nutricionista_id) as nutricionistas_vinculados
      FROM pacientes p
      LEFT JOIN turnos t ON p.id = t.paciente_id
      LEFT JOIN documentos d ON p.id = d.paciente_id
      LEFT JOIN vinculos_paciente_nutricionista v ON p.id = v.paciente_id AND v.activo = 1
      WHERE p.id = ?
    `;

    try {
      const results = await this.customQuery(query, [pacienteId]);
      return results[0];
    } catch (error) {
      console.error('Error getting patient activity summary:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo paciente
   */
  async crearPaciente(pacienteData) {
    const query = `
      INSERT INTO pacientes (
        id, nombre, apellido, email, contraseña_hash, 
        telefono, fecha_registro, activo
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)
    `;

    const params = [
      pacienteData.id,
      pacienteData.nombre,
      pacienteData.apellido,
      pacienteData.email,
      pacienteData.contraseñaHash,
      pacienteData.telefono
    ];

    try {
      const result = await this.customQuery(query, params);
      return { id: pacienteData.id, ...pacienteData };
    } catch (error) {
      console.error('Error creating paciente:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil del paciente
   */
  async actualizarPerfil(id, updateData) {
    const allowedFields = ['nombre', 'apellido', 'telefono'];
    const fields = Object.keys(updateData).filter(field => allowedFields.includes(field));
    
    if (fields.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);
    
    const query = `
      UPDATE pacientes 
      SET ${setClause}, fecha_modificacion = NOW()
      WHERE id = ? AND activo = 1
    `;

    try {
      const result = await this.customQuery(query, [...values, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating paciente profile:', error);
      throw error;
    }
  }

  /**
   * Verificar si el email ya existe
   */
  async verificarEmailExistente(email, excludeId = null) {
    let query = `SELECT id FROM pacientes WHERE email = ? AND activo = 1`;
    const params = [email];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    try {
      const results = await this.customQuery(query, params);
      return results.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Formatear paciente para respuesta
   */
  formatPaciente(paciente) {
    return {
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      email: paciente.email,
      telefono: paciente.telefono,
      fechaRegistro: paciente.fecha_registro,
      totalTurnos: parseInt(paciente.total_turnos) || 0,
      nutricionistasVinculados: parseInt(paciente.nutricionistas_vinculados) || 0
    };
  }
}

module.exports = PacienteDAO;
