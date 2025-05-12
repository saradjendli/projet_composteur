import React, { useCallback, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function verifierConnexion() {
      const isLoggedIn = await SecureStore.getItemAsync('isLoggedIn');
      if (isLoggedIn === 'true') {
        router.replace('/connexion'); //  Aller directement à Connexion si connecté
      }
    }

    verifierConnexion();
  }, []);

  // Redirection si pas encore connecté
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.replace('/accueil'); // Sinon aller vers Accueil
      }, 100);

      return () => clearTimeout(timer);
    }, [router])
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenue sur mon app !</Text>
    </View>
  );
}
