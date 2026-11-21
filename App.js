
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import {
  PaperProvider,
  MD3LightTheme,
  Button,
  Card,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const FavoritosContext = createContext();
const STORAGE_KEY = '@glowup_favoritos';

const tema = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D96C91',
    secondary: '#B84773',
    background: '#FDF3F6',
    surface: '#FFFFFF',
  },
};

// TELA INÍCIO
function Inicio() {
  const [frase, setFrase] = useState('');
  const [autor, setAutor] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { favoritos, adicionarFavorito, pronto } =
    useContext(FavoritosContext);

  const salvo = favoritos.some(
    item => item.frase === frase && item.autor === autor
  );

  const buscarFrase = async () => {
    setCarregando(true);

    try {
      const resposta = await fetch(
        'https://dummyjson.com/quotes/random'
      );

      if (!resposta.ok) {
        throw new Error('Erro ao buscar frase');
      }

      const dados = await resposta.json();

      const urlTraducao =
        'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(dados.quote) +
        '&langpair=en|pt-BR';

      const respostaTraducao = await fetch(urlTraducao);

      if (!respostaTraducao.ok) {
        throw new Error('Erro na tradução');
      }

      const traducao = await respostaTraducao.json();

      if (
        traducao.responseStatus !== 200 ||
        !traducao.responseData?.translatedText
      ) {
        throw new Error('Tradução indisponível');
      }

      let texto = traducao.responseData.translatedText;

      try {
        texto = decodeURIComponent(texto);
      } catch {
        texto = texto.replace(/%20/g, ' ');
      }

      setFrase(texto);
      setAutor(dados.author);

    } catch (erro) {
      Alert.alert(
        'Ops! 💗',
        'Não foi possível carregar a frase. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarFrase();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.decoracao}>✿ ♡ ✿</Text>
      <Text style={styles.logo}>GlowUp</Text>
      <Text style={styles.subtitulo}>
        Seu cantinho de inspiração 🌷
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.coracao}>♡</Text>
          <Text style={styles.tituloCard}>
            Inspiração do dia
          </Text>

          <View style={styles.linha} />

          {carregando ? (
            <ActivityIndicator
              animating={true}
              color="#D96C91"
              size="large"
              style={{ marginVertical: 35 }}
            />
          ) : (
            <>
              <Text style={styles.frase}>
                {frase ? `"${frase}"` : 'Busque uma inspiração!'}
              </Text>
              <Text style={styles.autor}>{autor}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="creation"
        style={styles.botao}
        contentStyle={styles.conteudoBotao}
        onPress={buscarFrase}
        disabled={carregando}
      >
        Nova inspiração
      </Button>

      <Button
        mode="outlined"
        icon={salvo ? 'heart' : 'heart-outline'}
        style={styles.botaoFavorito}
        disabled={!frase || carregando || salvo || !pronto}
        onPress={() => adicionarFavorito(frase, autor)}
      >
        {salvo ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}
      </Button>

      <Card style={styles.lembrete}>
        <Card.Content>
          <Text style={styles.tituloLembrete}>
            Um lembrete para você 💕
          </Text>
          <Text style={styles.textoLembrete}>
            Reserve um momento do seu dia para cuidar
            de si mesma e encontrar inspiração nas
            pequenas coisas.
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.rodape}>
        Feito com carinho ♡ GlowUp
      </Text>
    </ScrollView>
  );
}

// TELA FAVORITOS
function Favoritos() {
  const { favoritos, removerFavorito, pronto } =
    useContext(FavoritosContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.decoracao}>♡ ♡ ♡</Text>
      <Text style={styles.tituloTela}>
        Meus favoritos
      </Text>
      <Text style={styles.subtitulo}>
        Guarde aquilo que te inspira 💗
      </Text>

      {!pronto ? (
        <ActivityIndicator color="#D96C91" />
      ) : favoritos.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.coracao}>♡</Text>
            <Text style={styles.tituloCard}>
              Nenhuma frase salva
            </Text>
            <Text style={styles.textoLembrete}>
              Suas inspirações favoritas aparecerão aqui.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        favoritos.map(item => (
          <Card key={item.id} style={styles.cardFavorito}>
            <Card.Content>
              <Text style={styles.fraseFavorita}>
                "{item.frase}"
              </Text>
              <Text style={styles.autor}>
                {item.autor}
              </Text>
              <IconButton
                icon="heart-remove-outline"
                iconColor="#D96C91"
                style={{ alignSelf: 'flex-end' }}
                accessibilityLabel="Remover dos favoritos"
                onPress={() => removerFavorito(item.id)}
              />
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

// TELA SOBRE
function Sobre() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.decoracao}>✿ ♡ ✿</Text>
      <Text style={styles.logo}>GlowUp</Text>
      <Text style={styles.subtitulo}>
        Versão 2.0
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.tituloCard}>
            Sobre o aplicativo
          </Text>

          <Text style={styles.textoSobre}>
            O GlowUp é um aplicativo criado para promover
            inspiração, motivação e autocuidado por meio
            de frases inspiradoras traduzidas para português.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.cardFavorito}>
        <Card.Content>
          <Text style={styles.tituloCard}>
            Tecnologias utilizadas
          </Text>

          {[
            'React Native',
            'Expo',
            'JavaScript',
            'React Navigation',
            'React Native Paper',
            'AsyncStorage',
            'API DummyJSON',
            'API MyMemory',
          ].map(tecnologia => (
            <Text key={tecnologia} style={styles.tecnologia}>
              ♡ {tecnologia}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.lembrete}>
        <Card.Content>
          <Text style={styles.tituloLembrete}>
            Projeto acadêmico
          </Text>
          <Text style={styles.textoLembrete}>
            Desenvolvido por Victoria Larissa Soares
          </Text>
          <Text style={styles.textoLembrete}>
            Análise e Desenvolvimento de Sistemas
          </Text>
          <Text style={styles.textoLembrete}>
            Faculdade Senac Pernambuco
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

// APLICATIVO PRINCIPAL
export default function App() {
  const [favoritos, setFavoritos] = useState([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const carregarFavoritos = async () => {
      try {
        const dados = await AsyncStorage.getItem(STORAGE_KEY);

        if (dados) {
          setFavoritos(JSON.parse(dados));
        }

        setPronto(true);
      } catch (erro) {
        Alert.alert('Erro', 'Não foi possível carregar os favoritos.');
      }
    };

    carregarFavoritos();
  }, []);

  const adicionarFavorito = async (frase, autor) => {
    const existe = favoritos.some(
      item => item.frase === frase && item.autor === autor
    );

    if (existe) return;

    const novos = [
      ...favoritos,
      {
        id: Date.now().toString(),
        frase,
        autor,
      },
    ];

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(novos)
      );

      setFavoritos(novos);
      Alert.alert('Salvo! 💗', 'Frase adicionada aos favoritos.');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar a frase.');
    }
  };

  const removerFavorito = async id => {
    const novos = favoritos.filter(item => item.id !== id);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(novos)
      );

      setFavoritos(novos);
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível remover a frase.');
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={tema}>
        <FavoritosContext.Provider
          value={{
            favoritos,
            adicionarFavorito,
            removerFavorito,
            pronto,
          }}
        >
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#FDF3F6',
                },
                headerShadowVisible: false,
                headerTintColor: '#B84773',
                tabBarActiveTintColor: '#D96C91',
                tabBarInactiveTintColor: '#AD8492',
                tabBarStyle: {
                  backgroundColor: '#FFFFFF',
                  borderTopColor: '#F5D5E0',
                },
              }}
            >
              <Tab.Screen
                name="Início"
                component={Inicio}
                options={{
                  tabBarIcon: ({ color }) => (
                    <Text style={{ color, fontSize: 25 }}>⌂</Text>
                  ),
                }}
              />

              <Tab.Screen
                name="Favoritos"
                component={Favoritos}
                options={{
                  tabBarIcon: ({ color }) => (
                    <Text style={{ color, fontSize: 25 }}>♡</Text>
                  ),
                }}
              />

              <Tab.Screen
                name="Sobre"
                component={Sobre}
                options={{
                  tabBarIcon: ({ color }) => (
                    <Text style={{ color, fontSize: 25 }}>ⓘ</Text>
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </FavoritosContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// ESTILIZAÇÃO
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FDF3F6',
    padding: 24,
    paddingBottom: 35,
  },

  decoracao: {
    fontSize: 28,
    color: '#D96C91',
    textAlign: 'center',
    marginTop: 10,
  },

  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#C65380',
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 16,
    color: '#AD7489',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 25,
    marginBottom: 22,
  },

  coracao: {
    fontSize: 55,
    color: '#D96C91',
    textAlign: 'center',
  },

  tituloCard: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#B84773',
    textAlign: 'center',
    marginVertical: 12,
  },

  linha: {
    width: 55,
    height: 4,
    backgroundColor: '#F2BFD1',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 15,
  },

  frase: {
    fontSize: 21,
    lineHeight: 31,
    fontWeight: '600',
    textAlign: 'center',
    color: '#604B55',
    marginVertical: 15,
  },

  autor: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#BF7894',
    textAlign: 'center',
    marginVertical: 12,
  },

  botao: {
    borderRadius: 35,
    marginBottom: 12,
  },

  conteudoBotao: {
    paddingVertical: 12,
  },

  botaoFavorito: {
    borderRadius: 35,
    borderColor: '#D96C91',
    marginBottom: 25,
    paddingVertical: 5,
  },

  lembrete: {
    backgroundColor: '#FBE2EB',
    borderRadius: 25,
    marginVertical: 12,
    paddingVertical: 15,
  },

  tituloLembrete: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#B84773',
    marginBottom: 12,
  },

  textoLembrete: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#906577',
  },

  rodape: {
    textAlign: 'center',
    color: '#BF8B9F',
    marginTop: 25,
    fontSize: 14,
  },

  tituloTela: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C65380',
    textAlign: 'center',
    marginTop: 10,
  },

  cardFavorito: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 16,
    paddingVertical: 10,
  },

  fraseFavorita: {
    fontSize: 18,
    lineHeight: 26,
    color: '#604B55',
    textAlign: 'center',
  },

  textoSobre: {
    fontSize: 16,
    lineHeight: 26,
    color: '#906577',
    textAlign: 'center',
  },

  tecnologia: {
    fontSize: 16,
    color: '#906577',
    marginVertical: 7,
    marginLeft: 10,
  },
});
