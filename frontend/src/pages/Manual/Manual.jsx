import React, { useState, useEffect } from "react";
import styles from './Manual.module.css';
import perfilImage from "./perfil.png"; 
import axios from "axios"; 

const Manual = () => {
  const [unassignedFaces, setUnassignedFaces] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedFaces, setSelectedFaces] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    return imagePath ? `http://localhost:8000${imagePath}` : perfilImage;
  };

  const getFacesSemPerfil = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/media-files/');
      if (Array.isArray(response.data.files)) {
        return response.data.files.map(file => ({
          id: file.split('/').pop().split('.')[0],  
          image: file
        }));
      } else {
        console.error("Dados recebidos não são válidos:", response.data);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar faces não agrupadas:', error);
      return [];
    }
  };

  const getProfiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user_profile/list_profiles_with_faces/');
      setProfiles(response.data);
    } catch (error) {
      console.error("Erro ao buscar perfis com faces:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const facesData = await getFacesSemPerfil();
        setUnassignedFaces(facesData);
        await getProfiles();
      } catch (error) {
        console.error("Erro ao carregar os dados", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleFaceSelection = (faceId) => {
    setSelectedFaces((prev) =>
      prev.includes(faceId)
        ? prev.filter((id) => id !== faceId)
        : [...prev, faceId]
    );
  };

  const handleSave = () => {
    if (selectedFaces.length === 0) {
      alert('Por favor, selecione pelo menos uma face.');
      return;
    }
  
    if (!selectedProfileId) {
      alert('Por favor, selecione um perfil para associar as faces.');
      return;
    }
  
    const data = {
      profile_id: selectedProfileId, 
      face_ids: selectedFaces       
    };
  
    console.log("Enviando dados para associação:", data);
  
    setIsLoading(true);
  
    axios
      .post("http://localhost:8000/api/user_profile/associate_faces_to_profile/", data)
      .then((response) => {
        alert('Faces associadas com sucesso!');
        console.log("Faces associadas com sucesso:", response.data);
      })
      .catch((error) => {
        console.error("Erro ao associar faces:", error);
        alert('Erro ao associar faces.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDragStart = (event, faceId) => {
    event.dataTransfer.setData("faceId", faceId);
    event.target.classList.add(styles.dragging);  
  };

  const handleDragEnd = (event) => {
    event.target.classList.remove(styles.dragging); 
  };

  const handleDrop = (event, profileId) => {
    event.preventDefault();
    
    const faceIds = selectedFaces;
    if (faceIds.length === 0) {
      console.log('Nenhuma face selecionada para associar');
      return;
    }
  
    const facesToAssign = unassignedFaces.filter(face => faceIds.includes(face.id));
    
    if (facesToAssign.length === 0) {
      console.error('Nenhuma face encontrada.');
      return;
    }
  
    const data = {
      profile_id: profileId,
      face_ids: faceIds
    };
  
    axios
      .post("http://localhost:8000/api/user_profile/associate_faces_to_profile/", data)
      .then((response) => {
        console.log("Faces associadas com sucesso:", response.data);
  
        // Atualizar o perfil
        const updatedProfiles = profiles.map(profile => {
          if (profile.id === profileId) {
            setSelectedProfileId(profileId);
            return {
              ...profile,
              faces: [...profile.faces, ...facesToAssign] 
            };
          }
          return profile;
        });
  

        const updatedUnassignedFaces = unassignedFaces.filter(f => !faceIds.includes(f.id));
        setUnassignedFaces(updatedUnassignedFaces);
      })
      .catch((error) => {
        console.error("Erro ao associar faces:", error);
        alert('Erro ao associar faces.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  

  const handleDragOver = (event) => {
    event.preventDefault();
    event.target.classList.add(styles['drag-over']);
  };

  const handleDragLeave = (event) => {
    event.target.classList.remove(styles['drag-over']); 
  };

  return (
    <div className={styles['automatic-grouping']}>
      <div className={styles['left-side']}>
        <h2>Faces Não Agrupadas</h2>
        <div className={styles['faces-gallery']}>
          {isLoading ? (
            <p>Carregando faces...</p>
          ) : (
            unassignedFaces.length > 0 ? (
              unassignedFaces.map((face) => (
                <div
                  key={face.id}
                  className={`${styles['face-item']} ${
                    selectedFaces.includes(face.id) ? styles.selected : ""
                  }`}
                  onClick={() => toggleFaceSelection(face.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, face.id)}
                  onDragEnd={handleDragEnd}
                >
                  <img
                    src={getImageUrl(face.image)} 
                    alt={`Face ${face.id}`}
                    className={styles['face-image']}
                  />
                </div>
              ))
            ) : (
              <p>Nenhuma face encontrada.</p>
            )
          )}
        </div>
      </div>

      <button className={styles['save-button']} onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>

      <div className={styles['right-side2']}>
        <div className={styles['profile-square']}>
          <div className={styles['profile-rect-container']}>
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                className={styles['profile-rect']}
                onDrop={(e) => handleDrop(e, profile.id)} 
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onClick={() => setSelectedProfileId(profile.id)} 
              >
                <h3>{profile.name}</h3>
                <div className={styles['profile-gallery']}>
                  {profile.faces && profile.faces.length > 0 ? (
                    profile.faces.map((face, index) => (
                      <div key={index} className={styles['face-item']}>
                        <img
                          src={getImageUrl(face.image)} 
                          alt={`Perfil ${profile.name} - Face ${index + 1}`}
                          className={styles['face-image']}
                        />
                      </div>
                    ))
                  ) : (
                    <p>Sem faces associadas</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manual;
