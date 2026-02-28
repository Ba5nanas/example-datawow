// API service for backend communication
// Using Next.js API routes for SSR

const API_BASE_URL = '/api';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

// Pagination Interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface DashboardStats {
  totalCancel: number;
  totalSeats: number;
  totalReserve: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return await response.json();
  },
};

// User API
export const userApi = {
  login: async (loginData: LoginUserDto): Promise<User> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return await response.json();
  },

  register: async (userData: RegisterUserDto): Promise<User> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  },

  findAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  },

  findById: async (id: number): Promise<User | null> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  },
};

// Concert API
export interface Concert {
  id: number;
  name: string;
  description: string;
  seat: number;
  createdAt: string;
  updatedAt: string;
}

export const concertApi = {
  findAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Concert>> => {
    const response = await fetch(`${API_BASE_URL}/concerts?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch concerts');
    }
    return await response.json();
  },

  findById: async (id: number): Promise<Concert | null> => {
    const response = await fetch(`${API_BASE_URL}/concerts/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  },

  create: async (concertData: Partial<Concert>): Promise<Concert> => {
    const response = await fetch(`${API_BASE_URL}/concerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(concertData),
    });

    if (!response.ok) {
      throw new Error('Failed to create concert');
    }

    return await response.json();
  },

  update: async (id: number, concertData: Partial<Concert>): Promise<Concert> => {
    const response = await fetch(`${API_BASE_URL}/concerts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(concertData),
    });

    if (!response.ok) {
      throw new Error('Failed to update concert');
    }

    return await response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/concerts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete concert');
    }
  },
};

// Reservation API
export interface Reservation {
  id: number;
  userId: number;
  concertId: number;
  seats: number;
  status: 'reserved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user?: User;
  concert?: Concert;
}

export interface CreateReservationDto {
  userId: number;
  concertId: number;
  seats: number;
}

export const reservationApi = {
  create: async (reservationData: CreateReservationDto): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create reservation');
    }

    return await response.json();
  },

  findAll: async (page: number = 1, limit: number = 50): Promise<PaginatedResponse<Reservation>> => {
    const response = await fetch(`${API_BASE_URL}/reservations?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }
    return await response.json();
  },

  findByUserId: async (userId: number): Promise<Reservation[]> => {
    const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user reservations');
    }
    return await response.json();
  },

  findByConcertId: async (concertId: number): Promise<Reservation[]> => {
    const response = await fetch(`${API_BASE_URL}/reservations/concert/${concertId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch concert reservations');
    }
    return await response.json();
  },

  findById: async (id: number): Promise<Reservation | null> => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  },

  cancel: async (id: number, userId: number): Promise<Reservation> => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel?userId=${userId}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel reservation');
    }

    return await response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete reservation');
    }
  },
};