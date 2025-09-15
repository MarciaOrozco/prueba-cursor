"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import Layout from "@/components/Layout";
import Link from "next/link";

interface PerfilNutricionista {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidades: string[];
  modalidad: string[];
  rating: number;
  totalResenas: number;
  foto?: string;
  formacion?: Array<{
    titulo: string;
    institucion: string;
    año: number;
  }>;
  experiencia?: string;
  descripcion?: string;
  horariosAtencion?: Array<{
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>;
  reseñas?: Array<{
    id: string;
    pacienteNombre: string;
    rating: number;
    comentario: string;
    fecha: string;
  }>;
}

export default function PerfilNutricionistaPage() {
  const params = useParams();
  const id = params.id as string;

  const [perfil, setPerfil] = useState<PerfilNutricionista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAgendarForm, setShowAgendarForm] = useState(false);
  const [agendarForm, setAgendarForm] = useState({
    fecha: "",
    hora: "",
    modalidad: "presencial" as "presencial" | "virtual" | "mixta",
    metodoPago: "efectivo" as
      | "efectivo"
      | "transferencia"
      | "tarjeta_credito"
      | "tarjeta_debito"
      | "mercado_pago",
    motivo: "",
  });

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.obtenerPerfilNutricionista(id);
      setPerfil(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarPerfil();
    }
  }, [id]);

  const handleAgendarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.agendarTurno({
        nutricionistaId: id,
        ...agendarForm,
      });
      alert("Turno agendado exitosamente");
      setShowAgendarForm(false);
      setAgendarForm({
        fecha: "",
        hora: "",
        modalidad: "presencial",
        metodoPago: "efectivo",
        motivo: "",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al agendar el turno");
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half)"
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-5 h-5 text-gray-300 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  const formatEspecialidades = (especialidades: string[]) => {
    const labels: { [key: string]: string } = {
      nutricion_clinica: "Nutrición Clínica",
      nutricion_deportiva: "Nutrición Deportiva",
      nutricion_pediatrica: "Nutrición Pediátrica",
      obesidad: "Obesidad",
      diabetes: "Diabetes",
      celiaquia: "Celiaquía",
      vegetarianismo: "Vegetarianismo",
    };
    return especialidades.map((esp) => labels[esp] || esp);
  };

  const formatModalidad = (modalidad: string[]) => {
    const labels: { [key: string]: string } = {
      presencial: "Presencial",
      virtual: "Virtual",
      mixta: "Mixta",
    };
    return modalidad.map((mod) => labels[mod] || mod);
  };

  const formatDia = (dia: string) => {
    const labels: { [key: string]: string } = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
      domingo: "Domingo",
    };
    return labels[dia] || dia;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !perfil) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            {error || "Nutricionista no encontrado"}
          </p>
          <Link
            href="/nutricionistas"
            className="text-blue-600 hover:underline"
          >
            Volver a la lista
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Inicio
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/nutricionistas" className="hover:text-gray-700">
                Nutricionistas
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">
              {perfil.nombre} {perfil.apellido}
            </li>
          </ol>
        </nav>

        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {perfil.foto ? (
                <img
                  src={perfil.foto}
                  alt={`${perfil.nombre} ${perfil.apellido}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-semibold">
                    {perfil.nombre.charAt(0)}
                    {perfil.apellido.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info principal */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {perfil.nombre} {perfil.apellido}
                  </h1>
                  <p className="text-lg text-gray-600">{perfil.matricula}</p>

                  <div className="flex items-center mt-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(perfil.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {perfil.rating.toFixed(1)} ({perfil.totalResenas} reseñas)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAgendarForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Agendar Consulta
                </button>
              </div>

              {/* Especialidades y modalidades */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {formatEspecialidades(perfil.especialidades).map(
                    (especialidad, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {especialidad}
                      </span>
                    )
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formatModalidad(perfil.modalidad).map((modalidad, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {modalidad}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Información profesional */}
          <div className="space-y-6">
            {perfil.descripcion && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Descripción
                </h2>
                <p className="text-gray-700">{perfil.descripcion}</p>
              </div>
            )}

            {perfil.experiencia && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Experiencia
                </h2>
                <p className="text-gray-700">{perfil.experiencia}</p>
              </div>
            )}

            {perfil.formacion && perfil.formacion.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Formación
                </h2>
                <div className="space-y-3">
                  {perfil.formacion.map((formacion, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h3 className="font-medium text-gray-900">
                        {formacion.titulo}
                      </h3>
                      <p className="text-gray-600">{formacion.institucion}</p>
                      <p className="text-sm text-gray-500">{formacion.año}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Horarios y reseñas */}
          <div className="space-y-6">
            {perfil.horariosAtencion && perfil.horariosAtencion.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Horarios de Atención
                </h2>
                <div className="space-y-2">
                  {perfil.horariosAtencion.map((horario, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="font-medium text-gray-900">
                        {formatDia(horario.dia)}
                      </span>
                      <span className="text-gray-600">
                        {horario.horaInicio} - {horario.horaFin}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perfil.reseñas && perfil.reseñas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Reseñas Recientes
                </h2>
                <div className="space-y-4">
                  {perfil.reseñas.slice(0, 3).map((resena) => (
                    <div
                      key={resena.id}
                      className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {resena.pacienteNombre}
                        </span>
                        <div className="flex items-center space-x-1">
                          {renderStars(resena.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {resena.comentario}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(resena.fecha).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal para agendar turno */}
        {showAgendarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Agendar Consulta
              </h2>
              <form onSubmit={handleAgendarTurno} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={agendarForm.fecha}
                    onChange={(e) =>
                      setAgendarForm({ ...agendarForm, fecha: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={agendarForm.hora}
                    onChange={(e) =>
                      setAgendarForm({ ...agendarForm, hora: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad
                  </label>
                  <select
                    value={agendarForm.modalidad}
                    onChange={(e) =>
                      setAgendarForm({
                        ...agendarForm,
                        modalidad: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="mixta">Mixta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de pago
                  </label>
                  <select
                    value={agendarForm.metodoPago}
                    onChange={(e) =>
                      setAgendarForm({
                        ...agendarForm,
                        metodoPago: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta_credito">Tarjeta de Crédito</option>
                    <option value="tarjeta_debito">Tarjeta de Débito</option>
                    <option value="mercado_pago">Mercado Pago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de la consulta
                  </label>
                  <textarea
                    value={agendarForm.motivo}
                    onChange={(e) =>
                      setAgendarForm({ ...agendarForm, motivo: e.target.value })
                    }
                    rows={3}
                    placeholder="Describe brevemente el motivo de tu consulta..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAgendarForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
