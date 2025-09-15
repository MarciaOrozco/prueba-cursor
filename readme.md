# Nutrito – Plataforma de Gestión Nutricional

## Descripción del Negocio

Nutrito es una plataforma web diseñada para conectar **pacientes** y **nutricionistas**, simplificando la gestión de turnos, consultas, documentos clínicos y seguimiento nutricional.  
Su misión es mejorar la experiencia de atención, digitalizando procesos que habitualmente son manuales: búsqueda de profesionales, reserva de turnos, envío de estudios previos y notificaciones automáticas.

Basada en el modelo Cliente/Servidor de Tres Capas, la aplicación apunta a ser escalable, segura y cumplir con normativas de protección de datos (Ley 25.326 / GDPR).

---

## Arquitectura (visión general)

- **Frontend (Presentación):** Web responsive (Angular/React/Next.js).
- **Backend (Negocio):** Node.js con Express.
- **Base de datos (Datos):** MySQL o PostgreSQL.
- **Autenticación:** JWT.
- **Servicios externos:** notificaciones por correo, calendario (Google/Outlook).

---

## CORE 1: Agendar consulta con nutricionista

### Objetivo

Permitir al paciente **buscar un nutricionista, visualizar su perfil, seleccionar fecha/hora/modalidad, elegir método de pago y confirmar un turno**, quedando vinculado con el profesional.

### Casos de uso principales (CU-001)

1. **CU-001-001 Buscar nutricionista**  
   El paciente accede al buscador, filtra por nombre, especialidad, modalidad o enfoque.

   - **UI de referencia:** Pantalla de listado con filtros (Nutrito.pdf, pág. 1).
   - **Modelo clave:** `Nutricionista {id, nombre, especialidad, modalidad[], rating}`

2. **CU-001-001-001 Refinar búsqueda**  
   Aplicación de filtros más específicos (checkboxes de especialidades, buscador por nombre).

   - **UI:** filtros laterales y barra superior.

3. **CU-001-002 Visualizar perfil profesional**  
   Mostrar información detallada: foto, especialidades, experiencia, reseñas, botón _Agendar consulta_.

   - **UI de referencia:** Perfil del nutricionista (Nutrito.pdf, pág. 2).
   - **Modelo clave:** `PerfilNutricionista {idNutricionista, formacion, experiencia, reseñas[]}`

4. **CU-001-003 Agendar turno**  
   Selección de fecha, hora y modalidad. Validación de disponibilidad.

   - **UI:** selector de fecha/hora/modalidad (Nutrito.pdf, pág. 4).
   - **Modelo clave:** `Turno {id, fecha, hora, modalidad, estado}`

   - **Subcasos asociados:**
     - **CU-001-003-001 Cancelar turno**
     - **CU-001-003-002 Reprogramar turno**
     - **CU-001-003-003 Generar evento de calendario**
     - **CU-001-003-004 Recibir notificación de confirmación**
     - **CU-001-003-005 Elegir método de pago**

5. **CU-001-004 Vincular paciente con profesional**  
   Una vez confirmado el turno, se genera un vínculo en BD entre paciente y nutricionista.
   - **Subcaso:** **CU-001-004-001 Adjuntar documentos previos** (el paciente sube análisis o estudios).
   - **UI de referencia:** “Mi perfil” con documentos y próximos turnos (Nutrito.pdf, pág. 6).

---

## Diagramas de Robustez y Secuencia

Los diagramas (ver tecnologia.pdf, sección 10.6.2) permiten derivar los **modelos de dominio** y los **mensajes entre capas**:

- **Robustez CU-001-001 (Buscar nutricionista):**

  - _Boundary:_ Pantalla buscador.
  - _Controller:_ Controlador búsqueda.
  - _Entity:_ Entidad Nutricionista.

- **Robustez CU-001-003 (Agendar turno):**

  - _Boundary:_ Formulario agendar.
  - _Controller:_ TurnoController.
  - _Entity:_ Turno, Paciente, Nutricionista.

- **Secuencia CU-001-003-005 (Elegir método de pago):**
  - Flujo entre pantalla de pagos → controlador → entidad Turno con atributo `metodoPago`.

---

## Modelos de datos (propuesta inicial)

Basado en los casos de uso de CORE 1:

- **Paciente**  
  `{ id, nombre, apellido, email, contraseñaHash, telefono }`

- **Nutricionista**  
  `{ id, nombre, apellido, matricula, especialidades[], modalidad[], rating }`

- **Turno**  
  `{ id, pacienteId, nutricionistaId, fecha, hora, modalidad, estado, metodoPago }`

- **VinculoPacienteNutricionista**  
  `{ id, pacienteId, nutricionistaId, fechaInicio }`

- **Documento**  
  `{ id, pacienteId, turnoId?, nombreArchivo, url, fechaCarga }`

---

## Requerimientos cubiertos en CORE 1

- **RF1** Registro y login (precondición).
- **RF2** Búsqueda y visualización de nutricionistas.
- **RF3** Agendar turnos.
- **RF4** Selección de método de pago.
- **RF10** Vinculación automática paciente–profesional.
- **RF11** Adjuntar documentos previos.
- **RF12** Notificaciones de confirmación.
- **RF14** Cancelar/Reprogramar turnos.
- **RF16** Sincronizar con calendario externo.

---

## Mockups de referencia (Nutrito.pdf)

- **Listado de nutricionistas** (buscar/refinar) – pág. 1.
- **Perfil profesional** – pág. 2.
- **Formulario agendar turno** – pág. 4.
- **Confirmación con recordatorio de calendario** – pág. 5.
- **Pantalla “Mi perfil” con próximos turnos y documentos** – pág. 6.

_(Se declaran como referencia visual para la implementación, ver archivo `Nutrito.pdf`.)_

---

## Próximos pasos

1. Implementar modelos y migraciones iniciales (Paciente, Nutricionista, Turno, Documento, Vinculo).
2. Generar contrato OpenAPI con endpoints:
   - `GET /nutricionistas` (con filtros).
   - `GET /nutricionistas/{id}`
   - `POST /turnos` (crear turno).
   - `PATCH /turnos/{id}/cancelar`
   - `PATCH /turnos/{id}/reprogramar`
   - `POST /turnos/{id}/documentos`
3. Implementar casos de uso CORE 1 en backend y frontend.
4. Integrar notificaciones por correo y calendario.

---
