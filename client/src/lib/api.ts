// API utility functions to replace Supabase calls

const API_BASE_URL = '';

export const api = {
  // Weight entries
  async getWeightEntries(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/weight-entries?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch weight entries');
    return response.json();
  },

  async createWeightEntry(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/weight-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create weight entry');
    return response.json();
  },

  async updateWeightEntry(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/weight-entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update weight entry');
    return response.json();
  },

  async deleteWeightEntry(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/weight-entries/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete weight entry');
    return response.json();
  },

  // Nutrition entries
  async getNutritionEntries(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/nutrition-entries?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch nutrition entries');
    return response.json();
  },

  async createNutritionEntry(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/nutrition-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create nutrition entry');
    return response.json();
  },

  async updateNutritionEntry(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/nutrition-entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update nutrition entry');
    return response.json();
  },

  async deleteNutritionEntry(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/nutrition-entries/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete nutrition entry');
    return response.json();
  },

  // Training sessions
  async getTrainingSessions(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/training-sessions?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch training sessions');
    return response.json();
  },

  async createTrainingSession(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/training-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create training session');
    return response.json();
  },

  async updateTrainingSession(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/training-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update training session');
    return response.json();
  },

  async deleteTrainingSession(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/training-sessions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete training session');
    return response.json();
  },

  // Judo Training Sessions (separate from physical preparation)
  async getJudoTrainingSessions(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/judo-training-sessions?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch judo training sessions');
    return response.json();
  },

  async createJudoTrainingSession(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/judo-training-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create judo training session');
    return response.json();
  },

  async updateJudoTrainingSession(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/judo-training-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update judo training session');
    return response.json();
  },

  async deleteJudoTrainingSession(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/judo-training-sessions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete judo training session');
    return response.json();
  },

  // Exercise Records
  async getExerciseRecords(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/exercise-records?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch exercise records');
    return response.json();
  },

  async createExerciseRecord(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/exercise-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create exercise record');
    return response.json();
  },

  async deleteExerciseRecordsBySession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/exercise-records/session/${sessionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete exercise records');
    return response.json();
  },

  async getSessionExercises(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/exercise-records/session/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch session exercises');
    return response.json();
  },

  // User profiles
  async getUserProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  async updateUserProfile(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async updateProfile(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // User roles
  async getUserRoles() {
    const response = await fetch(`${API_BASE_URL}/api/user-roles`);
    if (!response.ok) throw new Error('Failed to fetch user roles');
    return response.json();
  },

  async updateUserRole(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/user-roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  },

  // Techniques
  async getTechniques(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/techniques?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch techniques');
    return response.json();
  },

  async createTechnique(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/techniques`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create technique');
    return response.json();
  },

  // Tactical notes
  async getTacticalNotes(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/tactical-notes?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch tactical notes');
    return response.json();
  },

  async createTacticalNote(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/tactical-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create tactical note');
    return response.json();
  },

  async updateTacticalNote(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/tactical-notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update tactical note');
    return response.json();
  },

  async deleteTacticalNote(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/tactical-notes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete tactical note');
    return response.json();
  },

  // Analytics
  async getTrainingFrequency(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/training-frequency?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch training frequency');
    return response.json();
  },

  async getNutritionSummary(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/nutrition-summary?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch nutrition summary');
    return response.json();
  },

  async getProgressSummary(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/progress-summary?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch progress summary');
    return response.json();
  },

  async getExerciseProgression(userId: string, exerciseId?: string) {
    const url = exerciseId 
      ? `${API_BASE_URL}/api/analytics/exercise-progression?user_id=${userId}&exercise_id=${exerciseId}`
      : `${API_BASE_URL}/api/analytics/exercise-progression?user_id=${userId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch exercise progression');
    return response.json();
  },

  async getExercisesList(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/exercises?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch exercises list');
    return response.json();
  },

  // File upload placeholder
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  }
};