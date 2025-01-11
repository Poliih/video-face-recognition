import React, { useState } from "react";
import styles from './Profiles.module.css'; 

import perfilImage from "./perfil.png"; 
import { FaEdit, FaTrash, FaSyncAlt } from "react-icons/fa";

const Profiles = () => {
  const [profiles, setProfiles] = useState([
    { id: 1, name: "Pessoa 1", faces: [perfilImage] },
    { id: 2, name: "Pessoa 2", faces: [null] },
    { id: 3, name: "Pessoa 3", faces: [perfilImage] },
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserFace, setNewUserFace] = useState(null);

  const toggleFaceSelection = (faceId) => {
  };

  const handleEdit = (profileId) => {
    console.log("Editar perfil:", profileId);
  };

  const handleDelete = (profileId) => {
    console.log("Deletar perfil:", profileId);
    setProfiles(profiles.filter(profile => profile.id !== profileId));
  };

  const handleUpdate = (profileId) => {
    console.log("Atualizar perfil:", profileId);
  };

  const handleSave = () => {
    const newProfile = {
      id: profiles.length + 1,
      name: newUserName,
      faces: [newUserFace],
    };
    setProfiles([...profiles, newProfile]);
    setShowAddUser(false); 
  };

  return (
    <div className={styles['profile-page']}>
      <div className={styles['add-user-container']}>
        <button
          className={styles['save-button']}
          onClick={() => setShowAddUser(!showAddUser)}
        >
          {showAddUser ? "Cancelar" : "Adicionar Usuário"}
        </button>
      </div>

      {showAddUser && (
        <div className={styles['add-user-form']}>
          <input
            type="text"
            placeholder="Nome do Usuário"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setNewUserFace(URL.createObjectURL(e.target.files[0]))}
          />
          <button className={styles['save-button']} onClick={handleSave}>
            Salvar
          </button>
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
              <button
                className={styles['option-button']}
                onClick={() => handleUpdate(profile.id)}
              >
                <FaSyncAlt /> 
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
    </div>
  );
};

export default Profiles;
