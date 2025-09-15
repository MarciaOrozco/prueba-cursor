"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import Layout from "@/components/Layout";
import NutricionistaCard from "@/components/NutricionistaCard";

interface Nutricionista {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidades: string[];
  modalidad: string[];
  rating: number;
  totalResenas: number;
  foto?: string;
}

interface Filtros {
  nombre?: string;
  especialidad?: string[];
  modalidad?: string[];
  rating_min?: number;
}

export default function NutricionistasPage() {
  const [nutricionistas, setNutricionistas] = useState<Nutricionista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasNext: false,
    hasPrev: false,
  });

  const especialidades = [
    { value: "nutricion_clinica", label: "Nutrición Clínica" },
    { value: "nutricion_deportiva", label: "Nutrición Deportiva" },
    { value: "nutricion_pediatrica", label: "Nutrición Pediátrica" },
    { value: "obesidad", label: "Obesidad" },
    { value: "diabetes", label: "Diabetes" },
    { value: "celiaquia", label: "Celiaquía" },
    { value: "vegetarianismo", label: "Vegetarianismo" },
  ];

  const modalidades = [
    { value: "presencial", label: "Presencial" },
    { value: "virtual", label: "Virtual" },
    { value: "mixta", label: "Mixta" },
  ];

  const cargarNutricionistas = async (nuevosFiltros?: Filtros, offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const filtrosActuales = nuevosFiltros || filtros;
      const response = await apiClient.buscarNutricionistas({
        ...filtrosActuales,
        limit: 20,
        offset,
      });

      setNutricionistas(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar nutricionistas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNutricionistas();
  }, []);

  const handleFiltroChange = (key: keyof Filtros, value: any) => {
    const nuevosFiltros = { ...filtros, [key]: value };
    setFiltros(nuevosFiltros);
    cargarNutricionistas(nuevosFiltros, 0);
  };

  const handleEspecialidadToggle = (especialidad: string) => {
    const especialidadesActuales = filtros.especialidad || [];
    const nuevasEspecialidades = especialidadesActuales.includes(especialidad)
      ? especialidadesActuales.filter((e) => e !== especialidad)
      : [...especialidadesActuales, especialidad];

    handleFiltroChange(
      "especialidad",
      nuevasEspecialidades.length > 0 ? nuevasEspecialidades : undefined
    );
  };

  const handleModalidadToggle = (modalidad: string) => {
    const modalidadesActuales = filtros.modalidad || [];
    const nuevasModalidades = modalidadesActuales.includes(modalidad)
      ? modalidadesActuales.filter((m) => m !== modalidad)
      : [...modalidadesActuales, modalidad];

    handleFiltroChange(
      "modalidad",
      nuevasModalidades.length > 0 ? nuevasModalidades : undefined
    );
  };

  const handlePagination = (nuevoOffset: number) => {
    cargarNutricionistas(filtros, nuevoOffset);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nutricionistas
          </h1>
          <p className="text-gray-600">
            Encuentra el profesional ideal para tus necesidades nutricionales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Filtros
              </h2>

              {/* Búsqueda por nombre */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por nombre
                </label>
                <input
                  type="text"
                  value={filtros.nombre || ""}
                  onChange={(e) =>
                    handleFiltroChange("nombre", e.target.value || undefined)
                  }
                  placeholder="Nombre del nutricionista"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Especialidades */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades
                </label>
                <div className="space-y-2">
                  {especialidades.map((especialidad) => (
                    <label
                      key={especialidad.value}
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        checked={
                          filtros.especialidad?.includes(especialidad.value) ||
                          false
                        }
                        onChange={() =>
                          handleEspecialidadToggle(especialidad.value)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {especialidad.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modalidades */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad de atención
                </label>
                <div className="space-y-2">
                  {modalidades.map((modalidad) => (
                    <label key={modalidad.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          filtros.modalidad?.includes(modalidad.value) || false
                        }
                        onChange={() => handleModalidadToggle(modalidad.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {modalidad.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating mínimo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating mínimo
                </label>
                <select
                  value={filtros.rating_min || ""}
                  onChange={(e) =>
                    handleFiltroChange(
                      "rating_min",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Cualquier rating</option>
                  <option value="4">4+ estrellas</option>
                  <option value="4.5">4.5+ estrellas</option>
                </select>
              </div>

              {/* Limpiar filtros */}
              <button
                onClick={() => {
                  setFiltros({});
                  cargarNutricionistas({}, 0);
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            ) : (
              <>
                {/* Información de resultados */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Mostrando {nutricionistas.length} de {pagination.total}{" "}
                    nutricionistas
                  </p>
                </div>

                {/* Lista de nutricionistas */}
                {nutricionistas.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No se encontraron nutricionistas
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Intenta ajustar tus filtros de búsqueda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {nutricionistas.map((nutricionista) => (
                      <NutricionistaCard
                        key={nutricionista.id}
                        nutricionista={nutricionista}
                      />
                    ))}
                  </div>
                )}

                {/* Paginación */}
                {pagination.total > 0 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Página{" "}
                      {Math.floor(pagination.offset / pagination.limit) + 1} de{" "}
                      {Math.ceil(pagination.total / pagination.limit)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handlePagination(pagination.offset - pagination.limit)
                        }
                        disabled={!pagination.hasPrev}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() =>
                          handlePagination(pagination.offset + pagination.limit)
                        }
                        disabled={!pagination.hasNext}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
