"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { authManager } from "@/lib/auth";
import Layout from "@/components/Layout";
import TurnoCard from "@/components/TurnoCard";

interface Turno {
  id: string;
  fecha: string;
  hora: string;
  modalidad: string;
  estado: string;
  motivo?: string;
  nutricionista: {
    nombre: string;
    apellido: string;
    matricula: string;
  };
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"proximos" | "historial">(
    "proximos"
  );
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasNext: false,
    hasPrev: false,
  });

  const cargarTurnos = async (tab: "proximos" | "historial", offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (tab === "proximos") {
        response = await apiClient.obtenerProximosTurnos(20);
      } else {
        response = await apiClient.obtenerHistorialTurnos({
          limit: 20,
          offset,
        });
      }

      setTurnos(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los turnos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authManager.isAuthenticated()) {
      cargarTurnos(activeTab);
    } else {
      setError("Debes iniciar sesión para ver tus turnos");
      setLoading(false);
    }
  }, [activeTab]);

  const handleTabChange = (tab: "proximos" | "historial") => {
    setActiveTab(tab);
    cargarTurnos(tab, 0);
  };

  const handlePagination = (nuevoOffset: number) => {
    cargarTurnos(activeTab, nuevoOffset);
  };

  const handleCancelTurno = async (turnoId: string) => {
    if (confirm("¿Estás seguro de que quieres cancelar este turno?")) {
      try {
        await apiClient.cancelarTurno(turnoId, {
          motivo: "Cancelado por el paciente",
        });
        alert("Turno cancelado exitosamente");
        cargarTurnos(activeTab, pagination.offset);
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Error al cancelar el turno"
        );
      }
    }
  };

  const handleRescheduleTurno = (turnoId: string) => {
    // Por ahora solo mostramos un mensaje
    alert("Función de reprogramación en desarrollo");
  };

  if (!authManager.isAuthenticated()) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mis Turnos</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Requerido
            </h2>
            <p className="text-gray-600 mb-4">
              Necesitas iniciar sesión para ver tus turnos
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Turnos</h1>
          <p className="text-gray-600">Gestiona tus consultas nutricionales</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("proximos")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "proximos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Próximos Turnos
              </button>
              <button
                onClick={() => handleTabChange("historial")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "historial"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Historial
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido */}
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
            {pagination.total > 0 && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Mostrando {turnos.length} de {pagination.total} turnos
                </p>
              </div>
            )}

            {/* Lista de turnos */}
            {turnos.length === 0 ? (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {activeTab === "proximos"
                    ? "No tienes turnos próximos"
                    : "No tienes turnos en el historial"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "proximos"
                    ? "Agenda una consulta para comenzar"
                    : "Tus turnos anteriores aparecerán aquí"}
                </p>
                {activeTab === "proximos" && (
                  <div className="mt-6">
                    <a
                      href="/nutricionistas"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Buscar Nutricionistas
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {turnos.map((turno) => (
                  <TurnoCard
                    key={turno.id}
                    turno={turno}
                    onCancel={handleCancelTurno}
                    onReschedule={handleRescheduleTurno}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {pagination.total > 0 && activeTab === "historial" && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página {Math.floor(pagination.offset / pagination.limit) + 1}{" "}
                  de {Math.ceil(pagination.total / pagination.limit)}
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
    </Layout>
  );
}
