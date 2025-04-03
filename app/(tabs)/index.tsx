import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text } from "react-native";
import { useRouter } from 'expo-router';

export default function IndexRedirect() {
  const router = useRouter();

  // Redirect logic on focus effect
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        router.replace('/accueil');
      }, 100); // Delay for layout rendering

      // Cleanup the timer when the component is unmounted or focus is lost
      return () => clearTimeout(timer);
    }, [router])
  );

  // On first render, show the Home screen message
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenue sur mon app !</Text>
    </View>
  );
}