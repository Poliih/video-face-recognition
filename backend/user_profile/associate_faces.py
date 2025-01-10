from django.apps import apps
import face_recognition

def associate_faces_to_profiles():
    Face = apps.get_model('video', 'Face')
    Profile = apps.get_model('user_profile', 'Profile')

    faces = Face.objects.filter(profile__isnull=True)

    profiles = Profile.objects.all()

    for face in faces:
        image_path = face.image.path
        print(f"Processando face na imagem: {image_path}")
        image = face_recognition.load_image_file(image_path)
        
        face_encoding = face_recognition.face_encodings(image)
        
        if not face_encoding: 
            print(f"Nenhuma face encontrada na imagem {image_path}")
            continue

        face_encoding = face_encoding[0]
        print(f"Face detectada na imagem {image_path} com codificação {face_encoding}")

        for profile in profiles:
            profile_image_path = profile.image.path
            print(f"Carregando imagem de perfil {profile_image_path}")
            profile_image = face_recognition.load_image_file(profile_image_path)
            
            profile_encoding = face_recognition.face_encodings(profile_image)
            
            if not profile_encoding: 
                print(f"Nenhuma face encontrada na imagem de perfil {profile_image_path}")
                continue

            profile_encoding = profile_encoding[0]
            print(f"Face do perfil {profile_image_path} com codificação {profile_encoding}")

            results = face_recognition.compare_faces([profile_encoding], face_encoding)
            
            tolerance = 0.6  
            face_distance = face_recognition.face_distance([profile_encoding], face_encoding)
            print(f"Distância entre faces: {face_distance[0]}")

            if face_distance[0] < tolerance:
                results = [True] 

            if results[0]:
                print(f"Associando a face {face.id} ao perfil {profile.id}")
                face.profile = profile
                face.save() 
                break 
            else:
                print(f"Sem correspondência para a face {face.id} com o perfil {profile.id}")
