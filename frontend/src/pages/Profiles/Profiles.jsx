import React, { useState, useEffect } from "react";
import styles from './Profiles.module.css';
import perfilImage from "./perfil.png";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserFace, setNewUserFace] = useState(null);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [message, setMessage] = useState("");  
  const [showMessage, setShowMessage] = useState(false); 
  const [messageType, setMessageType] = useState(''); 
  const [messageText, setMessageText] = useState(''); 


  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const getProfiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user_profile/list_profiles_with_faces/');
      setProfiles(response.data); 
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      alert("Erro ao buscar perfis");
    }
  };

  useEffect(() => {
    getProfiles(); 
  }, []);

  const handleEdit = (profileId) => {
    const profileToEdit = profiles.find(profile => profile.id === profileId);
    setNewUserName(profileToEdit.name);
    setNewUserFace(profileToEdit.faces[0]);
    setEditingProfileId(profileId);
    setShowAddUser(true);
  };

  const handleDelete = async (profileId) => {
    if (window.confirm("Tem certeza que deseja deletar este perfil?")) {
      try {
        const token = localStorage.getItem("authToken"); 
        const response = await axios.delete(`http://localhost:8000/api/user_profile/delete_profile/${profileId}/`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        });

        if (response.status === 204) {
          setProfiles((prevProfiles) => prevProfiles.filter(profile => profile.id !== profileId));
          setMessage("Perfil deletado com sucesso!");  
          setMessageType('success');
          setMessageText("Perfil deletado com sucesso!");
          setShowMessage(true);
        } else {
          setMessage(`Erro ao deletar perfil. Código de status: ${response.status}`); 
          setMessageType('error');
          setMessageText(`Erro ao deletar perfil. Código de status: ${response.status}`);
          setShowMessage(true);
        }
      } catch (error) {
        console.error("Erro ao deletar perfil:", error);
        setMessage(`Erro ao deletar perfil. Detalhes: ${error.message}`);  
        setMessageType('error');
        setMessageText(`Erro ao deletar perfil. Detalhes: ${error.message}`);
        setShowMessage(true);
      }
    }
  };

  const handleSave = async () => {
    if (!newUserName) {
      alert("O nome do usuário é obrigatório!");
      return;
    }

    const formData = new FormData();
    formData.append("name", newUserName);
    if (newUserFace) {
      formData.append("face_image", newUserFace);
    }

    try {
      let response;
      if (editingProfileId) {
        response = await axios.put(`http://localhost:8000/api/user_profile/update_profile/${editingProfileId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post('http://localhost:8000/api/user_profile/create_profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.status === 200) {
        const updatedProfiles = editingProfileId
          ? profiles.map(profile => profile.id === editingProfileId ? { ...profile, name: newUserName, faces: [newUserFace] } : profile)
          : [...profiles, { id: response.data.profile_id, name: newUserName, faces: [newUserFace] }];
          
        setProfiles(updatedProfiles);
        setShowAddUser(false);
        setNewUserName("");
        setNewUserFace(null);
        setEditingProfileId(null);
        setMessage("Perfil salvo com sucesso!");  
        setMessageType('success');
        setMessageText("Perfil salvo com sucesso!");
        setShowMessage(true);
      } else {
        alert("Erro ao salvar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar perfil");
    }
  };

  return (
      <div className={styles['profile-page']}>
        <div className={styles['add-user-container']}>
          {!showAddUser && (
            <button
              className={styles['save-button']}
              onClick={() => setShowAddUser(!showAddUser)}
            >
              {editingProfileId ? "Editar Perfil" : "Adicionar Usuário"}
            </button>
          )}
        </div>

        {showAddUser && (
          <div className={styles['add-user-form']}>
            <input
              type="text"
              placeholder="Nome do Usuário"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <div className={styles['buttons-container']}>
              <button
                className={styles['cancel-button']}
                onClick={() => setShowAddUser(false)}  
              >
                Cancelar
              </button>

              <button
                className={styles['save-button']}
                onClick={handleSave}  
              >
                Salvar
              </button>
            </div>
          </div>
        )}



      <div className={styles['profiles-gallery']}>
        {profiles.map((profile) => (
          <div key={profile.id} className={styles['profile-card']}>
            <div className={styles['options-container']}>
              <button
                className={styles['option-button']}
                onClick={() => handleEdit(profile.id)}
              >
                <FaEdit />
              </button>
              <button
                className={styles['option-button']}
                onClick={() => handleDelete(profile.id)}
              >
                <FaTrash />
              </button>
            </div>
            <h3>{profile.name}</h3>
            <div className={styles['profile-faces']}>
              {profile.faces.map((face, index) => (
                <div
                  key={index}
                  className={styles['face-item']}
                >
                  {face ? (
                    <img
                      src={face}
                      alt={`Perfil ${profile.name} - Face ${index + 1}`}
                      className={styles['face-image']}
                    />
                  ) : (
                    <div className={styles['face-placeholder']}>Sem imagem</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showMessage && (
        <div className={`${styles.message} ${styles[messageType]}`}>
          {messageText}
        </div>
      )}
    </div>
  );
};

export default Profiles;
