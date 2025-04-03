import React, { useState } from 'react';
import { Image, View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

const EcranAccueil: React.FC = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const router = useRouter();

  const UTILISATEUR = "admin";
  const MOT_DE_PASSE = "admin";

  const Seconnecter = () => {
    if (nomUtilisateur === UTILISATEUR && motDePasse === MOT_DE_PASSE) {
      alert(`Bienvenue ${nomUtilisateur}!`);
      router.push('/affichage');
    } else {
      alert('Identifiants incorrects, veuillez réessayer');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Newton-Composteur</Text>
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
      <Button title="Se connecter" onPress={Seconnecter} />
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
    color: '#4CAF50', 
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default EcranAccueil;