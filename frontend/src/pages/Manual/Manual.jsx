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

  const getImageUrl = (imagePath, fileId) => {
    if (imagePath) {
      const relativePath = imagePath.replace("/home/polianar/Documentos/GitHub/ComputerVision/backend", "");
      const finalPath = relativePath.startsWith("/media") ? relativePath : `/media${relativePath}`;
      const imageUrl = finalPath.replace("/media/media", "/media");
      return {
        imageUrl: `http://127.0.0.1:8000${imageUrl}`,
        id: fileId
      };
    }
    return {
      imageUrl: `${perfilImage}?id=${fileId}`,
      id: fileId
    };
  };

  const getFacesSemPerfil = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/video/faceslist/');
        if (Array.isArray(response.data)) {
            return response.data.map(file => ({
                id: file.id,
                image: file.image
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
    setSelectedFaces((prev) => {
      if (prev.includes(faceId)) {
        return prev.filter(id => id !== faceId);
      } else {
        return [faceId]; 
      }
    });
  };

  const handleSave = () => {
    if (!selectedProfileId || selectedFaces.length === 0) {
      alert("Por favor, selecione um perfil e ao menos uma face.");
      return;
    }
  
    const data = {
      profile_id: selectedProfileId, 
      face_ids: selectedFaces,        
    };
  
    axios
      .post("http://localhost:8000/api/user_profile/associate_faces_to_profile/", data)
      .then((response) => {
        alert("Faces associadas com sucesso!");
  
        // Verificar se response.data.faces é um array antes de mapear
        if (Array.isArray(response.data.faces)) {
          setProfiles((prev) =>
            prev.map((profile) =>
              profile.id === selectedProfileId
                ? { ...profile, faces: [...profile.faces, ...response.data.faces] }
                : profile
            )
          );
        } else {
          console.error("A resposta da API não contém um array válido de faces:", response.data.faces);
        }
  
        // Atualizar faces não associadas
        setUnassignedFaces((prevFaces) =>
          prevFaces.filter((face) => !selectedFaces.includes(face.id))
        );
        setSelectedFaces([]); 
  
        // Recarregar dados (faces e perfis)
        getFacesSemPerfil().then((facesData) => {
          setUnassignedFaces(facesData);
        });
        getProfiles();
      })
      .catch((error) => {
        console.error("Erro ao associar faces:", error.response?.data || error.message);
        const errorMessage = error.response?.data 
          ? `Erro ao associar faces. Dados enviados: \nPerfil ID: ${selectedProfileId}\nFaces IDs: ${selectedFaces}`
          : "Erro desconhecido ao associar faces.";
        alert(errorMessage);
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
    const faceId = parseInt(event.dataTransfer.getData("faceId"), 10);
    if (!profileId || !faceId) return;

    setSelectedProfileId(profileId);
    setSelectedFaces((prev) => [...new Set([...prev, faceId])]);

    event.target.classList.remove("drag-over");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (event.target.classList.contains(styles['profile-rect'])) {
      event.target.classList.add(styles.dragOver);
    }
  };

  const handleDragLeave = (event) => {
    if (event.target.classList.contains(styles['profile-rect'])) {
      event.target.classList.remove(styles.dragOver);
    }
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
              unassignedFaces.map((face) => {
                const { imageUrl } = getImageUrl(face.image, face.id); 
                return (
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
                      src={imageUrl} 
                      alt={`Face ${face.id}`} 
                      className={styles['face-image']}
                    />
                  </div>
                );
              })
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
                className={`${styles['profile-rect']} ${
                  selectedProfileId === profile.id ? styles.selectedProfile : ""
                }`}
                onDrop={(e) => handleDrop(e, profile.id)} 
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onClick={() => setSelectedProfileId(profile.id)} 
              >
                <h3>{profile.name}</h3>
                <div className={styles['profile-gallery']}>
                  {profile.faces && profile.faces.length > 0 ? (
                    profile.faces.map((face, index) => {
                      const { imageUrl, id } = getImageUrl(face.image, face.id); 
                      return (
                        <div key={id} className={styles['face-item']}>
                          <img
                            src={imageUrl} 
                            alt={`Perfil ${profile.name} - Face ${index + 1}`}
                            className={styles['face-image']}
                          />
                        </div>
                      );
                    })
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
}

export default Manual;
