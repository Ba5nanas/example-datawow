// API service for backend communication
// Using Next.js API routes for SSR

const API_BASE_URL = '/api';

// Helper function to get JWT token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt');
  }
  return null;
};

// Helper function to create headers with auth token
const createAuthHeaders = (headers: HeadersInit = {}): HeadersInit => {
  const token = getAuthToken();
  return {
    ...headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
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
    try {
      const headers = createAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers,
      });
      if (!response.ok) {
        console.log('Failed to fetch stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw error;
    }
  },
};

// User API
export const userApi = {
  login: async (loginData: LoginUserDto): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const error: ApiResponse<null> = await response.json();
        console.log(error.error || error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data in localStorage for client-side use
      if (data.access_token) {
        localStorage.setItem('jwt', data.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data.user || data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterUserDto): Promise<User> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error: ApiResponse<null> = await response.json();
        console.log(error.error || error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token and user data in localStorage for client-side use
      if (data.access_token) {
        localStorage.setItem('jwt', data.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data.user || data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Find by email error:', error);
      return null;
    }
  },

  findAll: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        console.log('Failed to fetch users');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Find all users error:', error);
      throw error;
    }
  },

  findById: async (id: number): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Find by id error:', error);
      return null;
    }
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
  findAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Concert> | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/concerts?page=${page}&limit=${limit}`);
      if (!response.ok) {
        console.log("Failed to fetch concerts")
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Find all concerts error:', error);
      throw error;
    }
  },

  findById: async (id: number): Promise<Concert | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/concerts/${id}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Find concert by id error:', error);
      return null;
    }
  },

  create: async (concertData: Partial<Concert>): Promise<Concert | null> => {
    try {
      const headers = createAuthHeaders({
        'Content-Type': 'application/json',
      });
      const response = await fetch(`${API_BASE_URL}/concerts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(concertData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to create concert');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Create concert error:', error);
      throw error;
    }
  },

  update: async (id: number, concertData: Partial<Concert>): Promise<Concert | null> => {
    try {
      const headers = createAuthHeaders({
        'Content-Type': 'application/json',
      });
      const response = await fetch(`${API_BASE_URL}/concerts/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(concertData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to update concert');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Update concert error:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const headers = createAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/concerts/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        console.log('Failed to delete concert');
      }
    } catch (error) {
      console.error('Delete concert error:', error);
      throw error;
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
  create: async (reservationData: CreateReservationDto): Promise<Reservation | null> => {
    try {
      const headers = createAuthHeaders({
        'Content-Type': 'application/json',
      });
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to create reservation');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Create reservation error:', error);
      throw error;
    }
  },

  findAll: async (page: number = 1, limit: number = 50): Promise<PaginatedResponse<Reservation> | null> => {
    try {
      const headers = createAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/reservations?page=${page}&limit=${limit}`, {
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to fetch reservations');
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Find all reservations error:', error);
      throw error;
    }
  },

  findByUserId: async (userId: number): Promise<Reservation[]> => {
    try {
      const headers = createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`, {
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to fetch user reservations');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Find reservations by user error:', error);
      return [];
    }
  },

  findByConcertId: async (concertId: number): Promise<Reservation[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/concert/${concertId}`);
      if (!response.ok) {
        console.log('Failed to fetch concert reservations');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Find reservations by concert error:', error);
      return [];
    }
  },

  findById: async (id: number): Promise<Reservation | null> => {
    try {
      const headers = createAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        headers,
      });
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Find reservation by id error:', error);
      return null;
    }
  },

  cancel: async (id: number, userId: number): Promise<Reservation | null> => {
    try {
      const headers = createAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel?userId=${userId}`, {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to cancel reservation');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel reservation error:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const headers = createAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        console.log('Failed to delete reservation');
      }
    } catch (error) {
      console.error('Delete reservation error:', error);
      throw error;
    }
  },
};
