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

  // User profiles
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