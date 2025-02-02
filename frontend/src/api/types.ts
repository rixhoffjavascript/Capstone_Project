export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  username: string;
  email: string;
  role: 'customer' | 'employee';
}

export interface Material {
  id: number;
  name: string;
  description: string;
  price_per_unit: number;
  unit: string;
  stock: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  base_price: number;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  version: string;
  environment: string;
  timestamp: string;
  database: {
    status: string;
    type: string;
    pool: {
      status: string;
      type: string;
      host: string;
      pool_size: number;
      max_overflow: number;
      pool_timeout: number;
      pool_recycle: number;
    };
  };
}
