const express = require("express");
const multer = require("multer");
const path = require("path");
const DocumentoController = require("../controllers/DocumentoController");
const { authMiddleware, requirePaciente } = require("../middleware/auth");
const { validateParams, validateFile } = require("../validators/validator");
const { documentoSchemas } = require("../validators/schemas");

const router = express.Router();
const documentoController = new DocumentoController();

// Configuración de multer para uploads
const upload = multer({
  dest: "uploads/temp/",
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (
      process.env.UPLOAD_ALLOWED_TYPES || "pdf,jpg,jpeg,png"
    ).split(",");
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(
            ", "
          )}`
        ),
        false
      );
    }
  },
});

/**
 * @swagger
 * /turnos/{id}/documentos:
 *   post:
 *     summary: Adjuntar documento al turno
 *     tags: [Documentos]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a adjuntar (PDF, JPG, PNG)
 *               nombre:
 *                 type: string
 *                 description: Nombre descriptivo del documento
 *               tipo:
 *                 type: string
 *                 enum: [analisis_sangre, estudios_imagen, informe_medico, otros]
 *                 description: Tipo de documento
 *             required:
 *               - archivo
 *               - nombre
 *               - tipo
 *     responses:
 *       201:
 *         description: Documento adjuntado exitosamente
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Turno no encontrado
 *       413:
 *         description: Archivo demasiado grande
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/:id/documentos",
  authMiddleware,
  requirePaciente,
  validateParams(documentoSchemas.adjuntarDocumento.params),
  upload.single("archivo"),
  validateFile(),
  documentoController.adjuntarDocumento.bind(documentoController)
);

/**
 * @swagger
 * /turnos/{id}/documentos:
 *   get:
 *     summary: Obtener documentos del turno
 *     tags: [Documentos]
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
 *         description: Lista de documentos del turno
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
  "/:id/documentos",
  authMiddleware,
  validateParams(documentoSchemas.obtenerDocumentosTurno.params),
  documentoController.obtenerDocumentosTurno.bind(documentoController)
);

/**
 * @swagger
 * /documentos/{id}/descargar:
 *   get:
 *     summary: Descargar documento
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del documento
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/:id/descargar",
  authMiddleware,
  validateParams(documentoSchemas.adjuntarDocumento.params), // Reutilizar schema de validación de ID
  documentoController.descargarDocumento.bind(documentoController)
);

/**
 * @swagger
 * /documentos/{id}:
 *   delete:
 *     summary: Eliminar documento
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del documento
 *     responses:
 *       200:
 *         description: Documento eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  "/:id",
  authMiddleware,
  validateParams(documentoSchemas.adjuntarDocumento.params), // Reutilizar schema de validación de ID
  documentoController.eliminarDocumento.bind(documentoController)
);

/**
 * @swagger
 * /documentos/mis-documentos:
 *   get:
 *     summary: Obtener documentos del paciente autenticado
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [analisis_sangre, estudios_imagen, informe_medico, otros]
 *         description: Filtrar por tipo de documento
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de documentos a obtener
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de documentos a omitir para paginación
 *     responses:
 *       200:
 *         description: Lista de documentos del paciente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/mis-documentos",
  authMiddleware,
  requirePaciente,
  documentoController.obtenerMisDocumentos.bind(documentoController)
);

/**
 * @swagger
 * /documentos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de documentos del paciente autenticado
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de documentos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/estadisticas",
  authMiddleware,
  requirePaciente,
  documentoController.obtenerEstadisticasDocumentos.bind(documentoController)
);

module.exports = router;
