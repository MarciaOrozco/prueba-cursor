import { paths } from "./types";

type ApiResponse<T> = {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  timestamp: string;
  path: string;
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000/v1"
  ) {
    this.baseUrl = baseUrl;

    // Obtener token del localStorage si existe (solo en cliente)
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error.message);
    }

    return response.json();
  }

  // Nutricionistas
  async buscarNutricionistas(params?: {
    nombre?: string;
    especialidad?: string[];
    modalidad?: string[];
    rating_min?: number;
    limit?: number;
    offset?: number;
  }): Promise<
    ApiResponse<
      paths["/nutricionistas"]["get"]["responses"][200]["content"]["application/json"]["data"]
    >
  > {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request(
      `/nutricionistas${queryString ? `?${queryString}` : ""}`
    );
  }

  async obtenerPerfilNutricionista(id: string): Promise<{
    data: paths["/nutricionistas/{id}"]["get"]["responses"][200]["content"]["application/json"]["data"];
  }> {
    return this.request(`/nutricionistas/${id}`);
  }

  async verificarDisponibilidad(
    id: string,
    fecha: string,
    hora: string
  ): Promise<{
    data: {
      nutricionistaId: string;
      fecha: string;
      hora: string;
      disponible: boolean;
    };
  }> {
    return this.request(
      `/nutricionistas/${id}/disponibilidad?fecha=${fecha}&hora=${hora}`
    );
  }

  async obtenerHorariosAtencion(
    id: string,
    fecha?: string
  ): Promise<{
    data: {
      nutricionistaId: string;
      horariosAtencion: Array<{
        dia: string;
        horaInicio: string;
        horaFin: string;
      }>;
      horariosDisponibles?: Array<{
        dia: string;
        hora_inicio: string;
        hora_fin: string;
        disponible: number;
      }>;
    };
  }> {
    const queryString = fecha ? `?fecha=${fecha}` : "";
    return this.request(`/nutricionistas/${id}/horarios${queryString}`);
  }

  // Turnos
  async agendarTurno(data: {
    nutricionistaId: string;
    fecha: string;
    hora: string;
    modalidad: "presencial" | "virtual" | "mixta";
    metodoPago:
      | "efectivo"
      | "transferencia"
      | "tarjeta_credito"
      | "tarjeta_debito"
      | "mercado_pago";
    motivo?: string;
  }): Promise<{
    data: paths["/turnos"]["post"]["responses"][201]["content"]["application/json"]["data"];
    message: string;
  }> {
    return this.request("/turnos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async obtenerTurno(id: string): Promise<{
    data: paths["/turnos/{id}"]["get"]["responses"][200]["content"]["application/json"]["data"];
  }> {
    return this.request(`/turnos/${id}`);
  }

  async cancelarTurno(
    id: string,
    data: {
      motivo: string;
      notificar_nutricionista?: boolean;
    }
  ): Promise<{
    data: paths["/turnos/{id}/cancelar"]["patch"]["responses"][200]["content"]["application/json"]["data"];
    message: string;
  }> {
    return this.request(`/turnos/${id}/cancelar`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async reprogramarTurno(
    id: string,
    data: {
      fecha: string;
      hora: string;
      modalidad?: "presencial" | "virtual" | "mixta";
    }
  ): Promise<{
    data: paths["/turnos/{id}/reprogramar"]["patch"]["responses"][200]["content"]["application/json"]["data"];
    message: string;
  }> {
    return this.request(`/turnos/${id}/reprogramar`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async obtenerProximosTurnos(limit?: number): Promise<ApiResponse<any[]>> {
    const queryString = limit ? `?limit=${limit}` : "";
    return this.request(`/turnos/proximos${queryString}`);
  }

  async obtenerHistorialTurnos(params?: {
    estado?: string[];
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request(
      `/turnos/historial${queryString ? `?${queryString}` : ""}`
    );
  }

  // Pacientes
  async obtenerTurnosPaciente(
    id: string,
    params?: {
      estado?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request(
      `/pacientes/${id}/turnos${queryString ? `?${queryString}` : ""}`
    );
  }

  async obtenerPerfilPaciente(id: string): Promise<{
    data: any;
  }> {
    return this.request(`/pacientes/${id}`);
  }

  async obtenerMiPerfil(): Promise<{
    data: any;
  }> {
    return this.request("/pacientes/mi-perfil");
  }

  async obtenerMisProximosTurnos(limit?: number): Promise<ApiResponse<any[]>> {
    const queryString = limit ? `?limit=${limit}` : "";
    return this.request(`/pacientes/mis-turnos/proximos${queryString}`);
  }

  // Documentos
  async obtenerDocumentosTurno(id: string): Promise<{
    data: any[];
  }> {
    return this.request(`/turnos/${id}/documentos`);
  }

  async adjuntarDocumento(
    turnoId: string,
    formData: FormData
  ): Promise<{
    data: any;
    message: string;
  }> {
    const url = `${this.baseUrl}/turnos/${turnoId}/documentos`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error.message);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
export default ApiClient;
