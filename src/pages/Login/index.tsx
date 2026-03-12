import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Logo from '../../assets/logo.png';
import { createStyles } from './styles';
import { useTheme } from '../../global/themes';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const styles = createStyles(theme);
  const Navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

  const handleLogin = () => {
    setIsLoading(true);

    setTimeout(() => {
      console.log('Login action', { email, password });
      Navigation.reset({
        index: 0,
        routes: [{ name: "PokemonList" }]
      })
      setIsLoading(false);
    }, 1500);
  };

  const isButtonDisable = isLoading || !email || !password;

  return (
    <View style={styles.container}>
      <View style={styles.boxTop}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.textTop}>Pokédex</Text>
      </View>

      <View style={styles.boxMid}>
        <Text style={styles.titleInput}>E-mail</Text>
        <View style={styles.boxInput}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.textInput}
          />
        </View>
        <Text style={styles.titleInput}>Senha</Text>
        <View style={styles.boxInput}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
            style={styles.textInput}
          />
        </View>
      </View>
      <View style={styles.boxBottom}>
        <TouchableOpacity style={[styles.buttonEntrar, isButtonDisable && { opacity: 0.3 }]}
          onPress={handleLogin}
          disabled={isButtonDisable}
        >
          {isLoading ? <ActivityIndicator color={theme.colors.text} /> :
            <Text style={styles.buttonEntrarText}>Entrar</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

