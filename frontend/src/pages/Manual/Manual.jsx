import React, { useState } from "react";
import styles from './Manual.module.css'; 
import perfilImage from "./perfil.png"; 

const Manual = () => {
  const unassignedFaces = [
    { id: 1, image_url: perfilImage },
    { id: 2, image_url: perfilImage },
    { id: 3, image_url: perfilImage },
    { id: 4, image_url: perfilImage },
    { id: 5, image_url: perfilImage },
    { id: 6, image_url: perfilImage },
    { id: 7, image_url: perfilImage },
    { id: 8, image_url: perfilImage },
    { id: 9, image_url: perfilImage },
    { id: 10, image_url: perfilImage },
    { id: 11, image_url: perfilImage },
    { id: 12, image_url: perfilImage },
    { id: 13, image_url: perfilImage },
    { id: 14, image_url: perfilImage },
    { id: 15, image_url: perfilImage },
    { id: 16, image_url: perfilImage },
    { id: 17, image_url: perfilImage },
    { id: 18, image_url: perfilImage },
    { id: 19, image_url: perfilImage },
    { id: 20, image_url: perfilImage },
    { id: 21, image_url: perfilImage },
    { id: 22, image_url: perfilImage },
    { id: 23, image_url: perfilImage },
    { id: 24, image_url: perfilImage }
  ];

  const profiles = [
    { id: 1, name: "Pessoa 1", faces: [null, null, null, null] },
    { id: 2, name: "Pessoa 2", faces: [null, null, null, null] },
    { id: 3, name: "Pessoa 3", faces: [null, null, null, null] }
  ];

  const [selectedFaces, setSelectedFaces] = useState([]);

  const toggleFaceSelection = (faceId) => {
    setSelectedFaces((prev) =>
      prev.includes(faceId)
        ? prev.filter((id) => id !== faceId)
        : [...prev, faceId]
    );
  };

  const handleSave = () => {
    console.log("Faces salvas!");
  };

  return (
    <div className={styles['automatic-grouping']}>
      <div className={styles['left-side']}>
        <h2>Faces Não Agrupadas</h2>
        <div className={styles['faces-gallery']}>
          {unassignedFaces.map((face) => (
            <div
              key={face.id}
              className={`${styles['face-item']} ${
                selectedFaces.includes(face.id) ? styles.selected : ""
              }`}
              onClick={() => toggleFaceSelection(face.id)}
            >
              <img src={face.image_url} alt={`Face ${face.id}`} className={styles['face-image']} />
            </div>
          ))}
        </div>
      </div>

      <button className={styles['save-button']} onClick={handleSave}>Salvar</button>

      <div className={styles['right-side2']}>
        <div className={styles['profile-square']}>
          <div className={styles['profile-rect-container']}>
            {profiles.map((profile) => (
              <div key={profile.id} className={styles['profile-rect']}>
                <h3>{profile.name}</h3>
                <div className={styles['profile-gallery']}>
                  {profile.faces.map((face, index) => (
                    <div key={index} className={styles['face-item']}>
                      {face ? (
                        <img src={face} alt={`Perfil ${profile.name} - Face ${index + 1}`} className={styles['face-image']} />
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
      </div>
    </div>
  );
};

export default Manual;
