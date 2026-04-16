import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native'; // Importe o Image
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';

// ... outros imports

export default function PokemonDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PokemonDetail'>>();
  const { id, photoUri } = route.params; // Captura o photoUri enviado pela câmera

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PokemonDetail'>>();

  function handleOpenCamera() {
    navigation.navigate('PokemonCamera', { id });
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Detalhes do Pokémon {id}</Text>

      {/* DESAFIO: Exibe o preview da imagem se ela existir no cache */}
      {photoUri && (
        <View style={{ marginVertical: 20, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Foto capturada:</Text>
          <Image 
            source={{ uri: photoUri }} 
            style={{ width: 150, height: 150, borderRadius: 10 }} 
          />
        </View>
      )}

      <TouchableOpacity
        onPress={handleOpenCamera}
        style={{
          backgroundColor: '#16a34a',
          padding: 12,
          borderRadius: 8,
          marginTop: 10
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Abrir câmera</Text>
      </TouchableOpacity>
    </View>
  );
}