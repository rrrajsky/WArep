import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8082',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  return API.post('/login', credentials);
};

export const fetchHouses = async () => {
  return API.get('/houses');
};

export const uploadFile = async (file, houseId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('houseId', houseId);
  return API.post('/upload', formData);
};

export const saveTriggers = async (houseId, triggers) => {
  return API.post('/triggers', { houseId, triggers });
};
