"use client";

import Link from "next/link";

interface NutricionistaCardProps {
  nutricionista: {
    id: string;
    nombre: string;
    apellido: string;
    matricula: string;
    especialidades: string[];
    modalidad: string[];
    rating: number;
    totalResenas: number;
    foto?: string;
  };
}

export default function NutricionistaCard({
  nutricionista,
}: NutricionistaCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 text-yellow-400 fill-current"
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
          className="w-4 h-4 text-yellow-400 fill-current"
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
          className="w-4 h-4 text-gray-300 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  const formatEspecialidades = (especialidades: string[]) => {
    return especialidades.map((esp) => {
      const labels: { [key: string]: string } = {
        nutricion_clinica: "Nutrición Clínica",
        nutricion_deportiva: "Nutrición Deportiva",
        nutricion_pediatrica: "Nutrición Pediátrica",
        obesidad: "Obesidad",
        diabetes: "Diabetes",
        celiaquia: "Celiaquía",
        vegetarianismo: "Vegetarianismo",
      };
      return labels[esp] || esp;
    });
  };

  const formatModalidad = (modalidad: string[]) => {
    return modalidad.map((mod) => {
      const labels: { [key: string]: string } = {
        presencial: "Presencial",
        virtual: "Virtual",
        mixta: "Mixta",
      };
      return labels[mod] || mod;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {nutricionista.foto ? (
              <img
                src={nutricionista.foto}
                alt={`${nutricionista.nombre} ${nutricionista.apellido}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl font-semibold">
                  {nutricionista.nombre.charAt(0)}
                  {nutricionista.apellido.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {nutricionista.nombre} {nutricionista.apellido}
                </h3>
                <p className="text-sm text-gray-600">
                  {nutricionista.matricula}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(nutricionista.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  ({nutricionista.totalResenas})
                </span>
              </div>
            </div>

            {/* Especialidades */}
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {formatEspecialidades(nutricionista.especialidades).map(
                  (especialidad, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {especialidad}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Modalidades */}
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {formatModalidad(nutricionista.modalidad).map(
                  (modalidad, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {modalidad}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <Link
            href={`/nutricionistas/${nutricionista.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
