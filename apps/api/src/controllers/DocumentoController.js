const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const DocumentoDAO = require('../dao/DocumentoDAO');
const TurnoDAO = require('../dao/TurnoDAO');

/**
 * Controlador para operaciones con documentos
 */
class DocumentoController {
  constructor() {
    this.documentoDAO = new DocumentoDAO();
    this.turnoDAO = new TurnoDAO();
  }

  /**
   * Adjuntar documento a un turno
   * POST /v1/turnos/:id/documentos
   */
  async adjuntarDocumento(req, res, next) {
    try {
      const { id: turnoId } = req.params;
      const { nombre, tipo } = req.body;
      const archivo = req.file;

      if (!archivo) {
        return res.status(400).json({
          error: {
            code: 'MISSING_FILE',
            message: 'Archivo requerido'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar que el turno existe y pertenece al usuario
      const turno = await this.turnoDAO.obtenerTurnoCompleto(turnoId);
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

      if (turno.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para adjuntar documentos a este turno'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Generar nombre único para el archivo
      const extension = path.extname(archivo.originalname);
      const nombreArchivo = `${uuidv4()}${extension}`;
      
      // Crear directorio si no existe
      const uploadDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Mover archivo a directorio de uploads
      const filePath = path.join(uploadDir, nombreArchivo);
      await fs.rename(archivo.path, filePath);

      // Crear registro en base de datos
      const documentoData = {
        id: uuidv4(),
        pacienteId: req.user.id,
        turnoId: turnoId,
        nombreArchivo: nombreArchivo,
        nombre: nombre,
        url: `/uploads/${nombreArchivo}`,
        tipo: tipo,
        tamaño: archivo.size
      };

      const nuevoDocumento = await this.documentoDAO.crearDocumento(documentoData);
      const documentoCompleto = await this.documentoDAO.obtenerDocumento(nuevoDocumento.id);

      res.status(201).json({
        data: documentoCompleto,
        message: 'Documento adjuntado exitosamente'
      });
    } catch (error) {
      console.error('Error in adjuntarDocumento:', error);
      
      // Limpiar archivo si hubo error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      
      next(error);
    }
  }

  /**
   * Obtener documentos de un turno
   * GET /v1/turnos/:id/documentos
   */
  async obtenerDocumentosTurno(req, res, next) {
    try {
      const { id: turnoId } = req.params;

      // Verificar que el turno existe y pertenece al usuario
      const turno = await this.turnoDAO.obtenerTurnoCompleto(turnoId);
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

      if (turno.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para ver los documentos de este turno'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const documentos = await this.documentoDAO.obtenerDocumentosTurno(turnoId);

      res.status(200).json({
        data: documentos
      });
    } catch (error) {
      console.error('Error in obtenerDocumentosTurno:', error);
      next(error);
    }
  }

  /**
   * Descargar documento
   * GET /v1/documentos/:id/descargar
   */
  async descargarDocumento(req, res, next) {
    try {
      const { id } = req.params;

      const documento = await this.documentoDAO.obtenerDocumento(id);
      if (!documento) {
        return res.status(404).json({
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Documento no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar permisos
      if (documento.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para descargar este documento'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      const filePath = path.join(__dirname, '../../uploads', documento.nombreArchivo);
      
      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'Archivo no encontrado en el servidor'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombreArchivo}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Enviar archivo
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error in descargarDocumento:', error);
      next(error);
    }
  }

  /**
   * Eliminar documento
   * DELETE /v1/documentos/:id
   */
  async eliminarDocumento(req, res, next) {
    try {
      const { id } = req.params;

      const documento = await this.documentoDAO.obtenerDocumento(id);
      if (!documento) {
        return res.status(404).json({
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Documento no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Verificar permisos
      if (documento.pacienteId !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'No tienes permisos para eliminar este documento'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Eliminar archivo del sistema de archivos
      const filePath = path.join(__dirname, '../../uploads', documento.nombreArchivo);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Error deleting file from filesystem:', error);
        // Continuar aunque falle la eliminación del archivo
      }

      // Eliminar registro de la base de datos
      const eliminado = await this.documentoDAO.eliminarDocumento(id, req.user.id);

      if (!eliminado) {
        return res.status(404).json({
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Documento no encontrado'
          },
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      res.status(200).json({
        message: 'Documento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error in eliminarDocumento:', error);
      next(error);
    }
  }

  /**
   * Obtener documentos del paciente
   * GET /v1/documentos/mis-documentos
   */
  async obtenerMisDocumentos(req, res, next) {
    try {
      const pacienteId = req.user.id;
      const { tipo, limit = 20, offset = 0 } = req.query;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        tipo: tipo
      };

      const resultado = await this.documentoDAO.obtenerDocumentosPaciente(pacienteId, options);

      res.status(200).json({
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error in obtenerMisDocumentos:', error);
      next(error);
    }
  }

  /**
   * Obtener estadísticas de documentos del paciente
   * GET /v1/documentos/estadisticas
   */
  async obtenerEstadisticasDocumentos(req, res, next) {
    try {
      const pacienteId = req.user.id;

      const estadisticas = await this.documentoDAO.obtenerEstadisticasDocumentos(pacienteId);

      res.status(200).json({
        data: {
          estadisticasPorTipo: estadisticas,
          totalDocumentos: estadisticas.reduce((sum, stat) => sum + stat.cantidad, 0),
          tamañoTotal: estadisticas.reduce((sum, stat) => sum + (stat.tamaño_total || 0), 0)
        }
      });
    } catch (error) {
      console.error('Error in obtenerEstadisticasDocumentos:', error);
      next(error);
    }
  }
}

module.exports = DocumentoController;
