import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';  


const Connexion: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter(); 

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.composteur.cielnewton.fr/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Mot de passe incorrect');
        } else {
          throw new Error('Erreur serveur');
        }
      }

      const data = await response.json();

      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        Alert.alert('Succès', 'Connexion réussie !');

        router.replace('/Commandes'); 
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (err: any) {
      console.error('Erreur de connexion :', err);
      setError(err.message || 'Erreur inconnue');
    }

    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Saisir le mot secret</Text>

      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 20
        }}
      />

      <Button title={loading ? "Connexion..." : "Se connecter"} onPress={handleLogin} disabled={loading} />

      {error ? (
        <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>
      ) : null}
    </View>
  );
};

export default Connexion;
