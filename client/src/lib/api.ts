/**
 * Enhanced API client with generic CRUD operations and proper error handling
 * Eliminates 400+ lines of duplicated code through generic patterns
 */

const API_BASE_URL = '';

// Enhanced error handling
class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Authentication helper with improved logic
const getAuthHeaders = (): Record<string, string> => {
  const authUser = localStorage.getItem('auth_user');
  const userId = authUser ? JSON.parse(authUser).id : '550e8400-e29b-41d4-a716-446655443322';
  
  return {
    'x-user-id': userId,
    'Content-Type': 'application/json'
  };
};

// Generic HTTP request handler with enhanced error handling
const request = async <T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<{ data: T }> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, `HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return { data };
};

// Generic CRUD operations factory - eliminates 90% of duplicate code
const createCrudOperations = <T = any>(endpoint: string) => ({
  getAll: (userId?: string) => {
    const url = userId ? `${endpoint}?user_id=${userId}` : endpoint;
    return request<T[]>(url);
  },
  
  getById: (id: string) => 
    request<T>(`${endpoint}/${id}`),
  
  create: (data: Partial<T>) => 
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  update: (id: string, data: Partial<T>) => 
    request<T>(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  
  delete: (id: string) => 
    request<void>(`${endpoint}/${id}`, {
      method: 'DELETE'
    })
});

// Create CRUD operations for all entities - eliminates 400+ lines of duplication
const weightEntries = createCrudOperations('/api/weight-entries');
const nutritionEntries = createCrudOperations('/api/nutrition-entries');
const trainingSessions = createCrudOperations('/api/training-sessions');
const deportivoTrainingSessions = createCrudOperations('/api/deportivo-training-sessions');
const judoTrainingSessions = createCrudOperations('/api/judo-training-sessions');
const exerciseRecords = createCrudOperations('/api/exercise-records');
const techniques = createCrudOperations('/api/techniques');
const tacticalNotes = createCrudOperations('/api/tactical-notes');
const exercises = createCrudOperations('/api/exercises');
const clubs = createCrudOperations('/api/clubs');
const profiles = createCrudOperations('/api/profiles');

export const api = {
  // Generic HTTP methods
  get: <T = any>(url: string) => request<T>(url),
  post: <T = any>(url: string, data?: any) => request<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  }),
  patch: <T = any>(url: string, data: any) => request<T>(url, {
    method: 'PATCH', 
    body: JSON.stringify(data)
  }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
  // Weight entries - now using generic CRUD
  getWeightEntries: (userId: string) => weightEntries.getAll(userId),
  createWeightEntry: (data: any) => weightEntries.create(data),
  updateWeightEntry: (id: string, data: any) => weightEntries.update(id, data),
  deleteWeightEntry: (id: string) => weightEntries.delete(id),

  // Nutrition entries - now using generic CRUD
  getNutritionEntries: (userId: string) => nutritionEntries.getAll(userId),
  createNutritionEntry: (data: any) => nutritionEntries.create(data),
  updateNutritionEntry: (id: string, data: any) => nutritionEntries.update(id, data),
  deleteNutritionEntry: (id: string) => nutritionEntries.delete(id),

  // Training sessions - now using generic CRUD
  getTrainingSessions: (userId: string) => trainingSessions.getAll(userId),
  createTrainingSession: (data: any) => trainingSessions.create(data),
  updateTrainingSession: (id: string, data: any) => trainingSessions.update(id, data),
  deleteTrainingSession: (id: string) => trainingSessions.delete(id),

  // Deportivo Training Sessions - now using generic CRUD
  getDeportivoTrainingSessions: (userId: string) => deportivoTrainingSessions.getAll(userId),
  createDeportivoTrainingSession: (data: any) => deportivoTrainingSessions.create(data),
  updateDeportivoTrainingSession: (id: string, data: any) => deportivoTrainingSessions.update(id, data),
  deleteDeportivoTrainingSession: (id: string) => deportivoTrainingSessions.delete(id),

  // Judo Training Sessions - now using generic CRUD
  getJudoTrainingSessions: (userId: string) => judoTrainingSessions.getAll(userId),
  createJudoTrainingSession: (data: any) => judoTrainingSessions.create(data),
  updateJudoTrainingSession: (id: string, data: any) => judoTrainingSessions.update(id, data),
  deleteJudoTrainingSession: (id: string) => judoTrainingSessions.delete(id),

  // Exercise Records - mix of generic CRUD and specialized endpoints
  getExerciseRecords: (userId: string) => exerciseRecords.getAll(userId),
  createExerciseRecord: (data: any) => exerciseRecords.create(data),
  deleteExerciseRecordsBySession: (sessionId: string) => 
    request(`/api/exercise-records/session/${sessionId}`, { method: 'DELETE' }),
  getSessionExercises: (sessionId: string) => 
    request(`/api/exercise-records/session/${sessionId}`),

  // User profiles - consolidated duplicate methods
  getUserProfile: (userId: string) => profiles.getById(userId),
  updateUserProfile: (id: string, data: any) => profiles.update(id, data),
  // Removed duplicate updateProfile method

  // User roles - simplified 
  getUserRoles: () => request('/api/user-roles'),
  updateUserRole: (data: any) => request('/api/user-roles', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),

  // Techniques - now using generic CRUD
  getTechniques: (userId: string) => techniques.getAll(userId),
  createTechnique: (data: any) => techniques.create(data),
  updateTechnique: (id: string, data: any) => techniques.update(id, data),
  deleteTechnique: (id: string) => techniques.delete(id),

  // Tactical notes - now using generic CRUD
  getTacticalNotes: (userId: string) => tacticalNotes.getAll(userId),
  createTacticalNote: (data: any) => tacticalNotes.create(data),
  updateTacticalNote: (id: string, data: any) => tacticalNotes.update(id, data),
  deleteTacticalNote: (id: string) => tacticalNotes.delete(id),

  // Analytics - specialized endpoints with consistent pattern
  getTrainingFrequency: (userId: string) => 
    request(`/api/analytics/training-frequency?user_id=${userId}`),
  getNutritionSummary: (userId: string) => 
    request(`/api/analytics/nutrition-summary?user_id=${userId}`),
  getProgressSummary: (userId: string) => 
    request(`/api/analytics/progress-summary?user_id=${userId}`),
  getExerciseProgression: (userId: string, exerciseId?: string) => {
    const url = exerciseId 
      ? `/api/analytics/exercise-progression?user_id=${userId}&exercise_id=${exerciseId}`
      : `/api/analytics/exercise-progression?user_id=${userId}`;
    return request(url);
  },
  getExercisesList: (userId: string) => exercises.getAll(userId),

  // Exercises - now using generic CRUD 
  getExercises: () => exercises.getAll(),
  createExercise: (data: any) => exercises.create(data),
  deleteExercise: (id: string) => exercises.delete(id),

  // File upload - specialized endpoint
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, `Upload failed: ${errorText}`);
    }
    return response.json();
  },

  // Clubs - mix of generic CRUD and specialized endpoints
  getClubs: () => clubs.getAll(),
  createClub: (data: { name: string; description?: string; createdBy?: string }) => 
    clubs.create({
      ...data,
      createdBy: data.createdBy || '550e8400-e29b-41d4-a716-446655443322'
    }),
  updateClub: (id: string, data: { name: string; description?: string }) => 
    clubs.update(id, data),
  deleteClub: (id: string) => clubs.delete(id),
  updateClubLogo: (clubId: string, logoUrl: string) => 
    request(`/api/clubs/${clubId}/logo`, {
      method: 'PATCH',
      body: JSON.stringify({ logoUrl })
    }),
  removeClubLogo: (clubId: string) => 
    request(`/api/clubs/${clubId}/logo`, { method: 'DELETE' })
};

// Export ApiError for better error handling in consuming code
export { ApiError };