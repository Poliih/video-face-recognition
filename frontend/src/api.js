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
    const response = await axios.post(`${API_URL}/user_profile/associate_faces_to_profile/`, {
      profile_id: profileId,
      face_ids: faceIds
    });
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

export const processVideo = async (videoId) => {
  try {
    const response = await axios.post(`${API_URL}/user_profile/process_video_view/${videoId}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar vídeo:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/user_profile/list_profiles_with_faces/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
};


export const updateProfile = async (profileId, updatedData) => {
  try {
    const response = await axios.put(`/api/update_profile/${profileId}/`, updatedData);
    console.log('Perfil atualizado com sucesso', response.data);
  } catch (error) {
    console.error('Erro ao atualizar perfil', error.response ? error.response.data : error.message);
  }
};

export const deleteProfile = async (profileId) => {
  try {

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                      document.cookie.match(/csrftoken=([\w-]+)/)?.[1];

    if (!csrfToken) {
      throw new Error('Token CSRF não encontrado!');
    }

    const response = await axios.delete(`/api/user_profile/delete_profile/${profileId}/`, {
      headers: {
        'X-CSRFToken': csrfToken,  
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
      }
    });

    if (response.status === 204) {
      console.log('Perfil deletado com sucesso', response.data);

    } else {
      console.error('Falha na exclusão do perfil', response.status);
    }
  } catch (error) {
    console.error('Erro ao deletar perfil', error.response ? error.response.data : error.message);
    alert('Erro ao deletar perfil: ' + (error.response?.data?.detail || error.message));
  }
};

export const getFacesSemPerfil = async () => {
  try {
    const response = await axios.get(`${API_URL}/list_faces_sem_perfil/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar faces sem perfil:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const getFacesSemPerfil2 = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/video/list_faces_sem_perfil2/');
    const facesData = response.data?.faces_sem_perfil || [];
    return Array.isArray(facesData) ? facesData : [];
  } catch (error) {
    console.error('Erro ao buscar faces não agrupadas:', error);
    return [];
  }
};

export const associateFaceToProfile = async (faceId, profileId) => {
  try {
    const response = await axios.post(`${API_URL}/video/faces/associar/`, {
      face_id: faceId,
      profile_id: profileId
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao associar face ao perfil:', error);
    throw error;
  }
};