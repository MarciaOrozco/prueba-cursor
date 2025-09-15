const { executeQuery, executeTransaction } = require("../config/database");

/**
 * Clase base para todos los DAOs
 * Proporciona métodos comunes para operaciones CRUD
 */
class BaseDAO {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Crear un nuevo registro
   */
  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => "?").join(", ");

    const query = `INSERT INTO ${this.tableName} (${fields.join(
      ", "
    )}) VALUES (${placeholders})`;

    try {
      const result = await executeQuery(query, values);
      return { id: result.insertId, ...data };
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener registro por ID
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;

    try {
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Obtener todos los registros con paginación
   */
  async findAll(options = {}) {
    const {
      limit = 20,
      offset = 0,
      orderBy = "id",
      orderDirection = "ASC",
    } = options;

    const query = `
      SELECT * FROM ${this.tableName} 
      ORDER BY ${orderBy} ${orderDirection} 
      LIMIT ? OFFSET ?
    `;

    try {
      const results = await executeQuery(query, [limit, offset]);

      // Obtener total para paginación
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const countResult = await executeQuery(countQuery);
      const total = countResult[0].total;

      return {
        data: results,
        pagination: {
          total,
          limit,
          offset,
          hasNext: offset + limit < total,
          hasPrev: offset > 0,
        },
      };
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar registro por ID
   */
  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");

    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;

    try {
      const result = await executeQuery(query, [...values, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar registro por ID
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;

    try {
      const result = await executeQuery(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Buscar registros con condiciones personalizadas
   */
  async findBy(conditions, options = {}) {
    const {
      limit = 20,
      offset = 0,
      orderBy = "id",
      orderDirection = "ASC",
    } = options;

    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = fields.map((field) => `${field} = ?`).join(" AND ");

    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE ${whereClause}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    try {
      const results = await executeQuery(query, [...values, limit, offset]);
      return results;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by conditions:`, error);
      throw error;
    }
  }

  /**
   * Contar registros con condiciones
   */
  async count(conditions = {}) {
    let query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const fields = Object.keys(conditions);
      const whereClause = fields.map((field) => `${field} = ?`).join(" AND ");
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    try {
      const result = await executeQuery(query, values);
      return result[0].total;
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar consulta personalizada
   */
  async customQuery(query, params = []) {
    try {
      const results = await executeQuery(query, params);
      return results;
    } catch (error) {
      console.error(
        `Error executing custom query for ${this.tableName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Ejecutar múltiples operaciones en una transacción
   */
  async executeTransaction(queries) {
    try {
      const results = await executeTransaction(queries);
      return results;
    } catch (error) {
      console.error(
        `Error executing transaction for ${this.tableName}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = BaseDAO;
