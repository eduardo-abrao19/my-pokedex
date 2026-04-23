import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../global/themes';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../routes';
import {
  fetchPokemonDetail,
  fetchPokemonSpecies,
  type PokemonDetailResponse,
  type PokemonSpeciesResponse
} from '../../services/pokeapi';
import { isFavorite, toggleFavorite } from '../../services/favoritesStorage';

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export default function PokemonDetailScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<RouteProp<RootStackParamList, 'PokemonDetail'>>();
  
  const { id, photoUri } = route.params;

  const [pokemon, setPokemon] = useState<PokemonDetailResponse | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PokemonDetail'>>();

  function handleOpenCamera() {
    navigation.navigate('PokemonCamera', { id });
  }

  function getPokemonDescriptionFromSpecies(species: PokemonSpeciesResponse): string | null {
    const ptEntry = species.flavor_text_entries.find((entry) => entry.language.name === 'pt-BR');
    if (ptEntry) return ptEntry.flavor_text.replace(/\s+/g, ' ').replace(/\f/g, ' ').trim();
    const enEntry = species.flavor_text_entries.find((entry) => entry.language.name === 'en');
    if (enEntry) return enEntry.flavor_text.replace(/\s+/g, ' ').replace(/\f/g, ' ').trim();
    return null;
  }

  async function handleToggleFavorite() {
    if (!pokemon) return;
    const summary = {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites.front_default ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      types: pokemon.types.map((t ) => t.type.name),
    };
    const updated = await toggleFavorite(summary);
    setFavorite(updated.some((item) => item.id === pokemon.id));
  }

  useEffect(() => {
    const controller = new AbortController();
    async function loadPokemon() {
      try {
        setIsLoading(true);
        setError(null);
        const [detail, species] = await Promise.all([
          fetchPokemonDetail(id, { signal: controller.signal }),
          fetchPokemonSpecies(id, { signal: controller.signal }),
        ]);
        setPokemon(detail);
        setDescription(getPokemonDescriptionFromSpecies(species));
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError('Não foi possível carregar os dados!');
      } finally {
        setIsLoading(false);
      }
    }
    async function loadFavoriteStatus() {
      try {
        const result = await isFavorite(id);
        setFavorite(result);
      } finally {
        setFavoriteLoading(false);
      }
    }
    loadPokemon();
    loadFavoriteStatus();
    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>{error ?? 'Erro inesperado.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{pokemon.name}</Text>
          <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
        </View>

        <View style={styles.typeContainer}>
          {pokemon.types.map(({ type }) => (
            <View key={type.name} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type.name] ?? '#A8A8A8' }]}>
              <Text style={styles.typeText}>{type.name}</Text>
            </View>
          ))}
        </View>

        {photoUri ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Image 
              source={{ uri: photoUri }} 
              style={[styles.image, { borderRadius: 12, borderWidth: 3, borderColor: '#16a34a' }]} 
            />
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
              Foto capturada em cache
            </Text>
          </View>
        ) : (
          pokemon.sprites.front_default && (
            <Image source={{ uri: pokemon.sprites.front_default }} style={styles.image} />
          )
        )}
      </View>
      
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={handleToggleFavorite}
          disabled={favoriteLoading}
          style={{ backgroundColor: favorite ? '#FFCB05' : '#E5E7EB', padding: 10, borderRadius: 999 }}
        >
          <Text style={{ fontWeight: '700' }}>{favorite ? '★ Favorito' : '☆ Favoritar'}</Text>
        </TouchableOpacity>
          
        <TouchableOpacity
          onPress={handleOpenCamera}
          style={{ backgroundColor: '#16a34a', padding: 10, borderRadius: 999 }}
        >
          <Text style={{ fontWeight: '700', color: '#fff' }}>Tirar nova foto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <Text style={styles.sectionText}>{description ?? 'Sem descrição.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats base</Text>
        {pokemon.stats.map((stat) => (
          <View key={stat.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{stat.stat.name.toUpperCase()}</Text>
            <Text style={styles.statValue}>{stat.base_stat}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}