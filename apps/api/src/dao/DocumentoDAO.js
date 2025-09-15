const BaseDAO = require('./BaseDAO');

/**
 * DAO para operaciones con documentos
 */
class DocumentoDAO extends BaseDAO {
  constructor() {
    super('documentos');
  }

  /**
   * Crear un nuevo documento
   */
  async crearDocumento(documentoData) {
    const query = `
      INSERT INTO documentos (
        id, paciente_id, turno_id, nombre_archivo, nombre, 
        url, tipo, tamaño, fecha_carga
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      documentoData.id,
      documentoData.pacienteId,
      documentoData.turnoId,
      documentoData.nombreArchivo,
      documentoData.nombre,
      documentoData.url,
      documentoData.tipo,
      documentoData.tamaño
    ];

    try {
      const result = await this.customQuery(query, params);
      return { id: documentoData.id, ...documentoData };
    } catch (error) {
      console.error('Error creating documento:', error);
      throw error;
    }
  }

  /**
   * Obtener documentos de un turno
   */
  async obtenerDocumentosTurno(turnoId) {
    const query = `
      SELECT 
        d.*,
        t.fecha as turno_fecha,
        t.hora as turno_hora,
        n.nombre as nutricionista_nombre,
        n.apellido as nutricionista_apellido
      FROM documentos d
      JOIN turnos t ON d.turno_id = t.id
      JOIN nutricionistas n ON t.nutricionista_id = n.id
      WHERE d.turno_id = ?
      ORDER BY d.fecha_carga DESC
    `;

    try {
      const results = await this.customQuery(query, [turnoId]);
      return results.map(this.formatDocumento);
    } catch (error) {
      console.error('Error getting turno documents:', error);
      throw error;
    }
  }

  /**
   * Obtener documentos de un paciente
   */
  async obtenerDocumentosPaciente(pacienteId, options = {}) {
    const { limit = 20, offset = 0, tipo = null } = options;
    
    let query = `
      SELECT 
        d.*,
        t.fecha as turno_fecha,
        t.hora as turno_hora,
        n.nombre as nutricionista_nombre,
        n.apellido as nutricionista_apellido
      FROM documentos d
      LEFT JOIN turnos t ON d.turno_id = t.id
      LEFT JOIN nutricionistas n ON t.nutricionista_id = n.id
      WHERE d.paciente_id = ?
    `;
    
    const params = [pacienteId];

    if (tipo) {
      query += ` AND d.tipo = ?`;
      params.push(tipo);
    }

    query += ` ORDER BY d.fecha_carga DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const results = await this.customQuery(query, params);
      
      // Obtener total para paginación
      let countQuery = `SELECT COUNT(*) as total FROM documentos d WHERE d.paciente_id = ?`;
      const countParams = [pacienteId];
      
      if (tipo) {
        countQuery += ` AND d.tipo = ?`;
        countParams.push(tipo);
      }

      const countResult = await this.customQuery(countQuery, countParams);
      const total = countResult[0].total;

      return {
        data: results.map(this.formatDocumento),
        pagination: {
          total,
          limit,
          offset,
          hasNext: offset + limit < total,
          hasPrev: offset > 0
        }
      };
    } catch (error) {
      console.error('Error getting patient documents:', error);
      throw error;
    }
  }

  /**
   * Obtener documento por ID
   */
  async obtenerDocumento(id) {
    const query = `
      SELECT 
        d.*,
        t.fecha as turno_fecha,
        t.hora as turno_hora,
        n.nombre as nutricionista_nombre,
        n.apellido as nutricionista_apellido
      FROM documentos d
      LEFT JOIN turnos t ON d.turno_id = t.id
      LEFT JOIN nutricionistas n ON t.nutricionista_id = n.id
      WHERE d.id = ?
    `;

    try {
      const results = await this.customQuery(query, [id]);
      if (results.length === 0) {
        return null;
      }
      return this.formatDocumento(results[0]);
    } catch (error) {
      console.error('Error getting documento:', error);
      throw error;
    }
  }

  /**
   * Eliminar documento
   */
  async eliminarDocumento(id, pacienteId) {
    const query = `
      DELETE FROM documentos 
      WHERE id = ? AND paciente_id = ?
    `;

    try {
      const result = await this.customQuery(query, [id, pacienteId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting documento:', error);
      throw error;
    }
  }

  /**
   * Verificar que el documento pertenece al paciente
   */
  async verificarPropiedadDocumento(documentoId, pacienteId) {
    const query = `
      SELECT id FROM documentos 
      WHERE id = ? AND paciente_id = ?
    `;

    try {
      const results = await this.customQuery(query, [documentoId, pacienteId]);
      return results.length > 0;
    } catch (error) {
      console.error('Error verifying document ownership:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de documentos por tipo
   */
  async obtenerEstadisticasDocumentos(pacienteId) {
    const query = `
      SELECT 
        tipo,
        COUNT(*) as cantidad,
        SUM(tamaño) as tamaño_total
      FROM documentos 
      WHERE paciente_id = ?
      GROUP BY tipo
    `;

    try {
      const results = await this.customQuery(query, [pacienteId]);
      return results;
    } catch (error) {
      console.error('Error getting document statistics:', error);
      throw error;
    }
  }

  /**
   * Formatear documento para respuesta
   */
  formatDocumento(documento) {
    return {
      id: documento.id,
      pacienteId: documento.paciente_id,
      turnoId: documento.turno_id,
      nombreArchivo: documento.nombre_archivo,
      nombre: documento.nombre,
      url: documento.url,
      tipo: documento.tipo,
      tamaño: documento.tamaño,
      fechaCarga: documento.fecha_carga,
      turno: documento.turno_fecha ? {
        fecha: documento.turno_fecha,
        hora: documento.turno_hora,
        nutricionista: {
          nombre: documento.nutricionista_nombre,
          apellido: documento.nutricionista_apellido
        }
      } : null
    };
  }
}

module.exports = DocumentoDAO;
