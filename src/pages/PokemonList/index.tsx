import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../global/themes';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';

// ... (Mantenha o MOCK_POKEMON_LIST aqui)
const MOCK_POKEMON_LIST = [
  {
    id: 1,
    name: 'bulbasaur',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    types: ['grass', 'poison'],
  },
  {
    id: 4,
    name: 'charmander',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    types: ['fire'],
  },
  {
    id: 7,
    name: 'squirtle',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    types: ['water'],
  },
];

export default function PokemonListScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const Navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PokemonList'>>();

  // Função para deslogar e limpar a pilha de navegação
  const handleLogout = () => {
    Navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8} 
        onPress={() => Navigation.navigate('PokemonDetail', {id: item.id})}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.typeContainer}>
          {item.types.map((type: string) => (
            <View key={type} style={styles.typeBadge}>
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com Título e Botão Sair */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 50, // Ajuste dependendo do entalhe do celular
        paddingBottom: 10 
      }}>
        <Text style={styles.headerTitle}>Pokédex</Text>
        
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ 
            color: '#FF4C4C', // Um vermelho suave para indicar "sair"
            fontWeight: 'bold',
            fontSize: 16 
          }}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_POKEMON_LIST}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};