import { apiClient } from "./api/client";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  tipo: "paciente" | "nutricionista" | "admin";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  private constructor() {
    // Inicializar desde localStorage si estamos en el cliente
    if (typeof window !== "undefined") {
      this.initializeFromStorage();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeFromStorage() {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState = {
          user,
          token,
          isAuthenticated: true,
        };
        apiClient.setToken(token);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        this.clearAuth();
      }
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Simular login - en una implementación real, esto sería una llamada a la API
      // Por ahora, usamos datos mock para desarrollo
      const mockUser: User = {
        id: "user-123",
        email: email,
        nombre: "Usuario",
        apellido: "Demo",
        tipo: "paciente",
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      this.setAuth(mockUser, mockToken);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error de autenticación",
      };
    }
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  private setAuth(user: User, token: string) {
    this.authState = {
      user,
      token,
      isAuthenticated: true,
    };

    // Guardar en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }

    // Configurar token en el cliente API
    apiClient.setToken(token);
  }

  private clearAuth() {
    this.authState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    // Limpiar localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }

    // Limpiar token del cliente API
    apiClient.setToken(null);
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  getUser(): User | null {
    return this.authState.user;
  }

  getToken(): string | null {
    return this.authState.token;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  isPaciente(): boolean {
    return this.authState.user?.tipo === "paciente";
  }

  isNutricionista(): boolean {
    return this.authState.user?.tipo === "nutricionista";
  }

  isAdmin(): boolean {
    return this.authState.user?.tipo === "admin";
  }
}

export const authManager = AuthManager.getInstance();
