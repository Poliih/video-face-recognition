import face_recognition
import numpy as np

def calculate_similarity(face_image, reference_images, threshold=0.6):

    unknown_image = face_recognition.load_image_file(face_image)
    unknown_encoding = face_recognition.face_encodings(unknown_image)[0]
    
    similar_faces = []
    
    for reference_image in reference_images:
        reference_image_data = face_recognition.load_image_file(reference_image)
        reference_encoding = face_recognition.face_encodings(reference_image_data)[0]
        
        distance = np.linalg.norm(unknown_encoding - reference_encoding)
        
        if distance < threshold:  
            similar_faces.append(reference_image)
    
    return similar_faces
