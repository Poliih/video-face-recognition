import React, { useState } from "react";
import "./Upload_pag.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { uploadVideo, getFaces } from '../../api';


const BASE_URL = "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/api`;

const Upload_pag = () => {
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [facesDetected, setFacesDetected] = useState(false); 

  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setFileName(file.name);
    } else {
      alert("Por favor, selecione um arquivo de vídeo válido!");
      setFileName("");
    }
  };

  
  const handleUploadVideo = async () => {
    const fileInput = document.getElementById("file-input");
    if (!fileInput.files[0]) {
      alert("Por favor, selecione um vídeo!");
      return;
    }

    const formData = new FormData();
    formData.append("video", fileInput.files[0]);

    setIsLoading(true); 
    try {
      const data = await uploadVideo(formData);  
      alert("Upload realizado com sucesso! Processando vídeo...");
      
      setTimeout(() => {
        fetchFaces(data.video_id); 
      }, 15000); 
    } catch (error) {
      console.error("Erro ao enviar o vídeo:", error);
      alert("Erro ao processar o vídeo.");
    } finally {
      setIsLoading(false); 
    }
  };

  // Função para buscar as faces do vídeo
  const fetchFaces = async (videoId) => {
    try {
      
      const data = await getFaces(videoId); 
      if (data.faces && data.faces.length > 0) {
        setFacesDetected(true); 
        alert("Faces detectadas com sucesso!");
      } else {
        alert("Nenhuma face detectada no vídeo.");
      }
    } catch (error) {
      console.error("Erro ao buscar faces:", error);
      alert("Erro ao detectar faces.");
    }
  };

  return (
    <div className="page">
      <div className="upload-box">
        <i className="fas fa-download upload-icon"></i>
        <input
          type="file"
          id="file-input"
          style={{ display: "none" }}
          accept="video/*"
          onChange={handleFileChange}
        />
        <button
          className="select-button"
          onClick={() => document.getElementById("file-input").click()}
        >
          Selecionar Vídeo
        </button>
        {fileName && <p>Arquivo selecionado: {fileName}</p>}
      </div>
      <button
        className="process-button"
        onClick={handleUploadVideo}
        disabled={isLoading} 
      >
        {isLoading ? "Enviando..." : "Enviar e Processar Vídeo"}
      </button>

    
    </div>
  );
};

export default Upload_pag;
