import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Fonction de hashage SHA-256 avec un Salt aléatoire
const hacher = async (chaine:string, salt:string) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    chaine + salt
  );
};

const PageInscription = () => {
  const router = useRouter();
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const handleInscription = async () => {
    if (!nomUtilisateur || !motDePasse) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const salt = Math.random().toString(36).substring(2, 15);

    const hashedUtilisateur = await hacher(nomUtilisateur, salt);
    const hashedMotDePasse = await hacher(motDePasse, salt);

    await SecureStore.setItemAsync('nomUtilisateur', hashedUtilisateur);
    await SecureStore.setItemAsync('motDePasse', hashedMotDePasse);
    await SecureStore.setItemAsync('salt', salt);

    Alert.alert('Succès', 'Inscription réussie !');
    router.push('/Accueil');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Inscription</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={nomUtilisateur}
        onChangeText={setNomUtilisateur}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <Button title="S'inscrire" onPress={handleInscription} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    width: '100%',
  },
});

export default PageInscription;
