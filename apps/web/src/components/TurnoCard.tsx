"use client";

import { useState } from "react";

interface TurnoCardProps {
  turno: {
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
  };
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export default function TurnoCard({
  turno,
  onCancel,
  onReschedule,
}: TurnoCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatHora = (hora: string) => {
    return hora.substring(0, 5); // HH:MM
  };

  const getEstadoColor = (estado: string) => {
    const colors: { [key: string]: string } = {
      pendiente: "bg-yellow-100 text-yellow-800",
      confirmado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
      completado: "bg-blue-100 text-blue-800",
      reprogramado: "bg-purple-100 text-purple-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      pendiente: "Pendiente",
      confirmado: "Confirmado",
      cancelado: "Cancelado",
      completado: "Completado",
      reprogramado: "Reprogramado",
    };
    return labels[estado] || estado;
  };

  const getModalidadLabel = (modalidad: string) => {
    const labels: { [key: string]: string } = {
      presencial: "Presencial",
      virtual: "Virtual",
      mixta: "Mixta",
    };
    return labels[modalidad] || modalidad;
  };

  const canCancel =
    turno.estado === "pendiente" || turno.estado === "confirmado";
  const canReschedule =
    turno.estado === "pendiente" || turno.estado === "confirmado";

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {turno.nutricionista.nombre} {turno.nutricionista.apellido}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                  turno.estado
                )}`}
              >
                {getEstadoLabel(turno.estado)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              {turno.nutricionista.matricula}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
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
                {formatFecha(turno.fecha)}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatHora(turno.hora)}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {getModalidadLabel(turno.modalidad)}
              </div>
            </div>

            {turno.motivo && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Motivo:</span> {turno.motivo}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  {canReschedule && onReschedule && (
                    <button
                      onClick={() => {
                        onReschedule(turno.id);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Reprogramar
                    </button>
                  )}
                  {canCancel && onCancel && (
                    <button
                      onClick={() => {
                        onCancel(turno.id);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
