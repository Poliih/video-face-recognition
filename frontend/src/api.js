import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; 

const csrfToken = document.cookie
  .split('; ')
  .find((row) => row.startsWith('csrftoken'))
  ?.split('=')[1];

axios.defaults.headers.common['X-CSRFToken'] = csrfToken;

export const uploadVideo = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/video/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload do vídeo:', error);
    throw error;
  }
};

export const getFaces = async (videoId) => {
  try {
    const response = await axios.get(`${API_URL}/video/faces/${videoId}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar faces do vídeo:', error);
    throw error;
  }
};

export const createProfile = async (profileData) => {
  try {
    const response = await axios.post(`${API_URL}/user_profile/create_profile/`, profileData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    throw error;
  }
};

export const associateFaces = async (profileId, faceIds) => {
  try {
    const response = await axios.post(`${API_URL}/user_profile/associate_faces/${profileId}/`, { face_ids: faceIds });
    return response.data;
  } catch (error) {
    console.error('Erro ao associar faces ao perfil:', error);
    throw error;
  }
};

export const generateSuggestions = async (referenceImages, faceImage) => {
  try {
    const response = await axios.post(`${API_URL}/user_profile/generate_suggestions/`, {
      reference_images: referenceImages,
      face_image: faceImage,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar sugestões de faces:', error);
    throw error;
  }
};

// Função para processar o vídeo (task assíncrona)
export const processVideo = async (videoId) => {
  try {
    const response = await axios.post(`${API_URL}/user_profile/process_video/${videoId}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar vídeo:', error);
    throw error;
  }
};

export const getProfile = async (profileId) => {
  try {
    const response = await axios.get(`${API_URL}/user_profile/faces/${profileId}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
};
