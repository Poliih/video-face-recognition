import os
import cv2
import face_recognition
import time
import dlib
from celery import shared_task
from django.conf import settings

def create_face_folder():
    face_image_dir = os.path.join(settings.MEDIA_ROOT, "face")
    if not os.path.exists(face_image_dir):
        os.makedirs(face_image_dir)
        print(f"Diretório criado: {face_image_dir}")
    else:
        print(f"Diretório já existe: {face_image_dir}")
    return face_image_dir

@shared_task
def process_video(video_id):
    try:
        video_path = f"videos/{video_id}.mp4"  
        video_full_path = os.path.join(settings.MEDIA_ROOT, video_path)

        print(f"Tentando acessar o vídeo no caminho: {video_full_path}")

        if not os.path.exists(video_full_path):
            print(f"Erro: Vídeo não encontrado no caminho {video_full_path}")
            return f"Erro: Vídeo não encontrado!"

        try:
            video_capture = cv2.VideoCapture(video_full_path)
            if not video_capture.isOpened():
                raise Exception(f"Erro ao abrir o vídeo {video_full_path}")
        except Exception as e:
            print(f"Erro ao abrir o vídeo: {e}")
            return f"Erro ao abrir o vídeo: {e}"

        fps = video_capture.get(cv2.CAP_PROP_FPS)  
        print(f"FPS do vídeo: {fps}")
        frame_interval = int(fps) 

        face_image_dir = create_face_folder()

        frame_count = 0  
        resize_factor = 0.7  
        saved_faces = set()  
        faces_saved_in_current_second = {}  
        trackers = []  

        predictor_path = os.path.join(settings.BASE_DIR, "shape_predictor_68_face_landmarks.dat")

        if not os.path.exists(predictor_path):
            print(f"Erro: Arquivo do modelo não encontrado no caminho {predictor_path}")
            return f"Erro: Arquivo do modelo não encontrado!"

        detector = dlib.get_frontal_face_detector()
        predictor = dlib.shape_predictor(predictor_path)  


        last_positions = {}

       
        last_saved_time = {}

        while True:
            ret = video_capture.grab() 
            if not ret:
                print("Fim do vídeo ou erro ao ler o quadro.")
                break
            
            ret, frame = video_capture.read()  
            if not ret or frame is None:
                print("Erro ao ler o frame.")
                break

            frame_count += 1
            print(f"Processando frame {frame_count}...")

            frame = cv2.resize(frame, None, fx=resize_factor, fy=resize_factor, interpolation=cv2.INTER_AREA)

            rgb_frame = frame[:, :, ::-1]

            if frame_count % int(fps) == 0:  
                face_locations = face_recognition.face_locations(rgb_frame)
                print(f"Faces detectadas no segundo {frame_count // int(fps)}: {len(face_locations)}")

                faces_to_save = []

                for face_location in face_locations:
                    top, right, bottom, left = face_location
                    face_key = (top, left, bottom, right) 

                    if face_key not in faces_saved_in_current_second.get(frame_count // int(fps), []):

                        faces_to_save.append(face_location)
                        if face_key not in faces_saved_in_current_second:
                            faces_saved_in_current_second[frame_count // int(fps)] = []

                        faces_saved_in_current_second[frame_count // int(fps)].append(face_key)

                for face_location in faces_to_save:
                    top, right, bottom, left = face_location
                    face_image_path = os.path.join(face_image_dir, f"face_{frame_count // int(fps)}_{top}_{left}_{int(time.time())}.jpg")
                    print(f"Tentando salvar a face: {face_image_path}")

                    if cv2.imwrite(face_image_path, frame[top:bottom, left:right]):
                        print(f"Face salva com sucesso: {face_image_path}")
                    else:
                        print(f"Falha ao salvar a face: {face_image_path}")

                    last_positions[face_key] = (top, left, bottom, right)

            if frame_count % int(fps) == 0 and len(face_locations) > 0:
                for face_location in face_locations:
                    top, right, bottom, left = face_location
                    new_tracker = dlib.correlation_tracker()
                    new_tracker.start_track(frame, dlib.rectangle(left, top, right, bottom))
                    trackers.append(new_tracker)

            if trackers:
                for tracker in trackers:
                    tracking_quality = tracker.update(frame)  
                    if tracking_quality >= 8.75:  
                        tracked_position = tracker.get_position()
                        top, left, bottom, right = int(tracked_position.top()), int(tracked_position.left()), int(tracked_position.bottom()), int(tracked_position.right())


                        timestamp = int(time.time())
                        if face_key not in last_saved_time or last_saved_time.get(face_key) != timestamp:

                            face_image_path = os.path.join(face_image_dir, f"face_rastreada_{timestamp}_{top}_{left}.jpg")
                            print(f"Tentando salvar a face rastreada: {face_image_path}")

                            if cv2.imwrite(face_image_path, frame[top:bottom, left:right]):
                                print(f"Face rastreada salva com sucesso: {face_image_path}")
                            else:
                                print(f"Falha ao salvar a face rastreada: {face_image_path}")

                            last_saved_time[face_key] = timestamp

        video_capture.release()
        print(f"Processamento do vídeo concluído com sucesso!")
        return "Vídeo processado com sucesso!"

    except Exception as e:
        print(f"Erro inesperado: {e}")
        return f"Erro ao processar o vídeo: {e}"
