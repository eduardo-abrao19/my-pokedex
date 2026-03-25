import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../global/themes';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';
import { PokemonListResponse } from '../../services/pokeapi';
import { fetchPokemonListPage, type PokemonListItemUI } from '../../services/pokeapi';

const PAGE_SIZE = 15;

export default function PokemonListScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PokemonList'>>();

  const [Items, setItems] = useState<PokemonListItemUI[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [isInitialLoading, setIsLoadingMore] = useState(true);
  const [isLoadingMore, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function loadInitial() {
    try {
      setError(null);
      setIsInitialLoading(true);
      const page = await fetchPokemonListPage(PAGE_SIZE, 0);
      setItems(page.items);
      setOffset(PAGE_SIZE);
      setHasNextPage(Boolean(page.next));
    } catch {
      setError('Falha ao carregar a lista de Pokémon.');
    } finally {
      setIsInitialLoading(false);
    }
  }

  async function loadMore() {
    if (isLoadingMore || isInitialLoading || isRefreshing || !hasNextPage) return;
    try {
      setIsLoadingMore(true);
      const page = await fetchPokemonListPage(PAGE_SIZE, offset);
      setItems((prev) => [...prev, ...page.items]);
      setOffset((prev) => prev + PAGE_SIZE);
      setHasNextPage(Boolean(page.next));
    } catch {
      setError('Falha ao carregar mais Pokémon.');
    } finally {
      setIsLoadingMore(false);
    }
  }


  async function refreshList() {
    try {
      setError(null);
      setIsRefreshing(true);
      const page = await fetchPokemonListPage(PAGE_SIZE, 0);
      setItems(page.items);
      setOffset(PAGE_SIZE);
      setHasNextPage(Boolean(page.next));
    } catch {
      setError('Falha ao atualizar a lista.');
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  // Função para deslogar e limpar a pilha de navegação
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  const renderItem = ({ item }: { item: PokemonListItemUI }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PokemonDetail', { id: item.id })}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.cardName}>{item.name}</Text>
        {/* {<View style={styles.typeContainer}>
          {item.types.map((type: string) => (
            <View key={type} style={styles.typeBadge}>
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>} */}
      </View>
      <Image source={{ uri: item.imagemUrl }} style={styles.cardImage} />
    </TouchableOpacity>
  );

  if (isInitialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>Carregando lista (simulado)...</Text>
      </View>
    );
  }
  if (error && Items.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text, marginBottom: 16 }}>{error}</Text>
      </View>
    );
  }

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
        data={Items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onRefresh={refreshList}
        refreshing={isRefreshing}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
};