import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text } from "react-native";
import { useRouter } from 'expo-router';

export default function IndexRedirect() {
  const router = useRouter();

  // Redirection
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.replace('/accueil');
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