import React, { useCallback, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text } from 'react-native';


export default function IndexRedirect() {
  const router = useRouter();

  // Redirection vers l'accueil
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/accueil'); 
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

