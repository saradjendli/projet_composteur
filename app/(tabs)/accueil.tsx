import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const hacher = async (chaine:string, salt:string) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    chaine + salt
  );
};

const EcranAccueil = () => {
  const router = useRouter();
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const seConnecter = async () => {
    const storedSalt = await SecureStore.getItemAsync('salt');
    const storedUser = await SecureStore.getItemAsync('nomUtilisateur');
    const storedPassword = await SecureStore.getItemAsync('motDePasse');

    if (!storedSalt || !storedUser || !storedPassword) {
      Alert.alert('Erreur', "Veuillez d'abord vous inscrire.");
      router.push('/inscription');
      return;
    }

    const hashedUtilisateur = await hacher(nomUtilisateur, storedSalt);
    const hashedMotDePasse = await hacher(motDePasse, storedSalt);

    if (hashedUtilisateur === storedUser && hashedMotDePasse === storedPassword) {
      // await SecureStore.setItemAsync('isLoggedIn', 'true'); //  Pour marquer l'utilisateur comme connecté
      Alert.alert('Bienvenue', nomUtilisateur);
      router.replace('/connexion'); //  Remplacer pour éviter retour arrière
    } else {
      Alert.alert('Erreur', 'Identifiants incorrects.');
    }
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Newton-compost</Text>
      <Image 
        source={require('../../assets/images/user.png')} 
        style={{ width: 200, height: 200 }} 
      />

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

      <Button title="Se connecter" onPress={seConnecter} />
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   titre: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingLeft: 8,
//     borderRadius: 5,
//     width: '100%',
//   },
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 20,
  },
  titre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#bbb',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});



export default EcranAccueil;
