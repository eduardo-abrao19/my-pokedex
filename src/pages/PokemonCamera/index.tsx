import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRoute, useNavigation } from '@react-navigation/native'; // Importação do navigation
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Tipagem do navigation
import { RootStackParamList } from '../../routes';
import { createStyles } from './styles';
import { useTheme } from '../../global/themes';

export default function PokemonCameraScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoResult, setPhotoResult] = useState<any>(null);

  const route = useRoute<RouteProp<RootStackParamList, 'PokemonCamera'>>();
  const { id } = route.params;

  // Instanciando o navigation para poder voltar para a tela anterior
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PokemonCamera'>>();

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Carregando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Precisamos da permissão da câmera.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
          <Text style={styles.actionText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleTakePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.7,
      skipProcessing: true,
    });

    if (photo) {
      setPhotoResult(photo);
      console.log('PHOTO_RESULT (pokemon id = ' + id + '):', photo);

      // DESAFIO: Navega de volta para a tela de Detalhes passando a URI da foto
      navigation.navigate({
        name: 'PokemonDetail',
        params: { id: id, photoUri: photo.uri },
        merge: true, 
      });
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
          <Text style={styles.actionText}>Tirar foto</Text>
        </TouchableOpacity>

        {photoResult ? (
          <ScrollView style={styles.jsonBox}>
            <Text selectable style={styles.jsonText}>
              {JSON.stringify(photoResult, null, 2)}
            </Text>
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}