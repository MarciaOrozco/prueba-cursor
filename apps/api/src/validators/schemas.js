const Joi = require("joi");

// Esquemas de validación basados en el OpenAPI

const nutricionistaSchemas = {
  buscarNutricionistas: {
    query: Joi.object({
      nombre: Joi.string().min(2).optional(),
      especialidad: Joi.array()
        .items(
          Joi.string().valid(
            "nutricion_clinica",
            "nutricion_deportiva",
            "nutricion_pediatrica",
            "obesidad",
            "diabetes",
            "celiaquia",
            "vegetarianismo"
          )
        )
        .optional(),
      modalidad: Joi.array()
        .items(Joi.string().valid("presencial", "virtual", "mixta"))
        .optional(),
      rating_min: Joi.number().min(1).max(5).optional(),
      limit: Joi.number().integer().min(1).max(100).default(20).optional(),
      offset: Joi.number().integer().min(0).default(0).optional(),
    }),
  },

  obtenerPerfilNutricionista: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },
};

const turnoSchemas = {
  agendarTurno: {
    body: Joi.object({
      nutricionistaId: Joi.string().uuid().required(),
      fecha: Joi.date().iso().greater("now").required(),
      hora: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      modalidad: Joi.string()
        .valid("presencial", "virtual", "mixta")
        .required(),
      metodoPago: Joi.string()
        .valid(
          "efectivo",
          "transferencia",
          "tarjeta_credito",
          "tarjeta_debito",
          "mercado_pago"
        )
        .required(),
      motivo: Joi.string().max(500).optional(),
    }),
  },

  obtenerTurno: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  cancelarTurno: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      motivo: Joi.string().required(),
      notificar_nutricionista: Joi.boolean().default(true).optional(),
    }),
  },

  reprogramarTurno: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      fecha: Joi.date().iso().greater("now").required(),
      hora: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      modalidad: Joi.string()
        .valid("presencial", "virtual", "mixta")
        .optional(),
    }),
  },
};

const documentoSchemas = {
  adjuntarDocumento: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      nombre: Joi.string().required(),
      tipo: Joi.string()
        .valid("analisis_sangre", "estudios_imagen", "informe_medico", "otros")
        .required(),
    }),
  },

  obtenerDocumentosTurno: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },
};

const pacienteSchemas = {
  obtenerTurnosPaciente: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    query: Joi.object({
      estado: Joi.array()
        .items(
          Joi.string().valid(
            "pendiente",
            "confirmado",
            "cancelado",
            "completado",
            "reprogramado"
          )
        )
        .optional(),
      limit: Joi.number().integer().min(1).max(100).default(20).optional(),
      offset: Joi.number().integer().min(0).default(0).optional(),
    }),
  },
};

// Esquemas de respuesta
const responseSchemas = {
  nutricionistaResumen: Joi.object({
    id: Joi.string().uuid().required(),
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
    matricula: Joi.string().required(),
    especialidades: Joi.array().items(Joi.string()).required(),
    modalidad: Joi.array().items(Joi.string()).required(),
    rating: Joi.number().min(1).max(5).required(),
    totalResenas: Joi.number().integer().min(0).required(),
    foto: Joi.string().uri().optional(),
  }),

  perfilNutricionista: Joi.object({
    id: Joi.string().uuid().required(),
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
    matricula: Joi.string().required(),
    especialidades: Joi.array().items(Joi.string()).required(),
    modalidad: Joi.array().items(Joi.string()).required(),
    rating: Joi.number().min(1).max(5).required(),
    totalResenas: Joi.number().integer().min(0).required(),
    foto: Joi.string().uri().optional(),
    formacion: Joi.array()
      .items(
        Joi.object({
          titulo: Joi.string().required(),
          institucion: Joi.string().required(),
          año: Joi.number().integer().required(),
        })
      )
      .optional(),
    experiencia: Joi.string().optional(),
    descripcion: Joi.string().optional(),
    horariosAtencion: Joi.array()
      .items(
        Joi.object({
          dia: Joi.string()
            .valid(
              "lunes",
              "martes",
              "miercoles",
              "jueves",
              "viernes",
              "sabado",
              "domingo"
            )
            .required(),
          horaInicio: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          horaFin: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        })
      )
      .optional(),
    reseñas: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().uuid().required(),
          pacienteNombre: Joi.string().required(),
          rating: Joi.number().integer().min(1).max(5).required(),
          comentario: Joi.string().required(),
          fecha: Joi.date().iso().required(),
        })
      )
      .optional(),
  }),

  turno: Joi.object({
    id: Joi.string().uuid().required(),
    pacienteId: Joi.string().uuid().required(),
    nutricionistaId: Joi.string().uuid().required(),
    fecha: Joi.date().iso().required(),
    hora: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    modalidad: Joi.string().valid("presencial", "virtual", "mixta").required(),
    estado: Joi.string()
      .valid(
        "pendiente",
        "confirmado",
        "cancelado",
        "completado",
        "reprogramado"
      )
      .required(),
    metodoPago: Joi.string()
      .valid(
        "efectivo",
        "transferencia",
        "tarjeta_credito",
        "tarjeta_debito",
        "mercado_pago"
      )
      .required(),
    fechaCreacion: Joi.date().iso().required(),
    fechaModificacion: Joi.date().iso().required(),
    paciente: Joi.object().optional(),
    nutricionista: Joi.object().optional(),
  }),

  documento: Joi.object({
    id: Joi.string().uuid().required(),
    pacienteId: Joi.string().uuid().required(),
    turnoId: Joi.string().uuid().optional(),
    nombreArchivo: Joi.string().required(),
    nombre: Joi.string().required(),
    url: Joi.string().uri().required(),
    tipo: Joi.string()
      .valid("analisis_sangre", "estudios_imagen", "informe_medico", "otros")
      .required(),
    tamaño: Joi.number().integer().optional(),
    fechaCarga: Joi.date().iso().required(),
  }),

  pagination: Joi.object({
    total: Joi.number().integer().min(0).required(),
    limit: Joi.number().integer().min(1).required(),
    offset: Joi.number().integer().min(0).required(),
    hasNext: Joi.boolean().required(),
    hasPrev: Joi.boolean().required(),
  }),
};

module.exports = {
  nutricionistaSchemas,
  turnoSchemas,
  documentoSchemas,
  pacienteSchemas,
  responseSchemas,
};
