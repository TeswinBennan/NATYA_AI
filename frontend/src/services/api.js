import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:8000`;
  }
  return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach Authorization Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('natyaa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('natyaa_token');
        localStorage.removeItem('natyaa_user');
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. HEALTH & SYSTEM
// ==========================================
export const getSystemHealth = async () => {
  const res = await api.get('/health/');
  return res.data;
};

// ==========================================
// 2. AUTHENTICATION & USER PROFILE
// ==========================================
export const registerUser = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await api.put('/auth/profile', profileData);
  return res.data;
};

// ==========================================
// 3. DATASET MODULE
// ==========================================
export const getDatasetStats = async () => {
  const res = await api.get('/dataset/stats');
  return res.data;
};

export const getDatasetList = async (category = '', page = 1, limit = 20) => {
  const res = await api.get('/dataset/list', {
    params: { category, page, limit }
  });
  return res.data;
};

export const uploadDatasetSample = async (formData) => {
  const res = await api.post('/dataset/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// ==========================================
// 4. IMAGE & VIDEO DANCE CLASSIFICATION & PREDICTION
// ==========================================
export const predictDanceImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/image-prediction/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const predictDanceVideo = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/image-prediction/predict-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return res.data;
};

// ==========================================
// 5. POSE ANALYSIS & KEYPOINTS
// ==========================================
export const analyzePoseImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/pose-analysis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const analyzeDanceVideo = async (file, danceForm, onUploadProgress) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('dance_form', danceForm);
  
  const res = await api.post('/video-analysis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return res.data;
};

export const processLiveFrame = async (blob, targetPose = 'Aramandi (Ayata)', danceForm = 'Bharatanatyam') => {
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');
  formData.append('target_pose', targetPose);
  formData.append('dance_form', danceForm);
  
  const res = await api.post('/pose-analysis/live-frame', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const saveLiveSession = async (sessionData) => {
  const res = await api.post('/pose-analysis/save-live-session', sessionData);
  return res.data;
};

// ==========================================
// 6. DIGITAL TWIN & POSE COMPARISON
// ==========================================
export const comparePoseImages = async (userFile, referenceFile = null, danceForm = 'auto') => {
  const formData = new FormData();
  formData.append('user_file', userFile);
  if (referenceFile) {
    formData.append('reference_file', referenceFile);
  }
  formData.append('dance_form', danceForm || 'auto');
  
  const res = await api.post('/pose-comparison/compare', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const comparePoseVideos = async (userFile, referenceFile = null, danceForm = 'auto', onUploadProgress = null) => {
  const formData = new FormData();
  formData.append('user_file', userFile);
  if (referenceFile) {
    formData.append('reference_file', referenceFile);
  }
  formData.append('dance_form', danceForm || 'auto');
  
  const res = await api.post('/pose-comparison/compare-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return res.data;
};

export const getReferencePoses = async (danceForm = '') => {
  const res = await api.get('/pose-comparison/reference-poses', {
    params: { dance_form: danceForm }
  });
  return res.data;
};

// ==========================================
// 7. PERFORMANCE HISTORY & DASHBOARD STATS
// ==========================================
export const getAnalysisHistory = async (limit = 50) => {
  const res = await api.get('/history/all', {
    params: { limit }
  });
  return res.data;
};

export const getUserHistory = async (analysisType = '', limit = 50) => {
  const res = await api.get('/history/user', {
    params: {
      analysis_type: analysisType && analysisType !== 'all' ? analysisType : undefined,
      limit
    }
  });
  return res.data;
};

export const getUserHistoryStats = async () => {
  const res = await api.get('/history/user/stats');
  return res.data;
};

export const getHistoryRecord = async (recordId) => {
  const res = await api.get(`/history/${recordId}`);
  return res.data;
};

export const deleteHistoryRecord = async (recordId) => {
  const res = await api.delete(`/history/${recordId}`);
  return res.data;
};

export const getDashboardSummary = async () => {
  const res = await api.get('/history/summary');
  return res.data;
};

// ==========================================
// 8. KAUMUDI KNOWLEDGE & LEXICON BASE
// ==========================================
export const getKnowledgeSummary = async () => {
  const res = await api.get('/knowledge/summary');
  return res.data;
};

export const getDanceFormKnowledge = async (danceForm) => {
  const res = await api.get('/knowledge/details', {
    params: { dance_form: danceForm }
  });
  return res.data;
};

// ==========================================
// 9. HASTHA MUDRA RECOGNITION & DICTIONARY
// ==========================================
export const getMudraDictionary = async () => {
  const res = await api.get('/mudra/dictionary');
  return res.data;
};

export const getAsamyutaHastasList = async () => {
  const res = await api.get('/mudra/asamyuta');
  return res.data;
};

export const getSamyutaHastasList = async () => {
  const res = await api.get('/mudra/samyuta');
  return res.data;
};

export const classifyMudraImage = async (file, targetMudra = '', handType = 'single') => {
  const formData = new FormData();
  formData.append('file', file);
  if (targetMudra) formData.append('target_mudra', targetMudra);
  formData.append('hand_type', handType);
  const res = await api.post('/mudra/classify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const analyzeMudraGesture = async (file, handType = 'single') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('hand_type', handType);
  const res = await api.post('/mudra/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// ==========================================
// 10. AI NATYA GURU MULTILINGUAL CHATBOT
// ==========================================
export const askGuruChat = async (message, history = [], language = 'english') => {
  const res = await api.post('/guru-chat/ask', {
    message,
    history,
    language
  });
  return res.data;
};

export default api;
