import { useState, useEffect } from 'react';
import { Image, View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Fonction de hashage SHA-256 avec un Salt aléatoire
const hacher = async (chaine: string, salt: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    chaine + salt
  );
};

const EcranAccueil: React.FC = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [tentatives, setTentatives] = useState<number>(0);
  const router = useRouter();

  // Initialisation des identifiants au lancement de l'application (si non définis)
  useEffect(() => {
    const initialiserIdentifiants = async () => {
      const storedUser = await SecureStore.getItemAsync('nomUtilisateur');
      const storedPassword = await SecureStore.getItemAsync('motDePasse');
      const storedSalt = await SecureStore.getItemAsync('salt');

      if (!storedUser || !storedPassword || !storedSalt) {

        // Génération d'un Salt unique
        const salt = Math.random().toString(36).substring(2, 15);

        // Sauvegarde du Salt
        await SecureStore.setItemAsync('salt', salt);

        // Hashage des identifiants par défaut
        const hashedIdentifiant = await hacher("admin", salt);
        const hashedMotDePasse = await hacher("admin", salt);

        // Sauvegarde des identifiants
        await SecureStore.setItemAsync('nomUtilisateur', hashedIdentifiant);
        await SecureStore.setItemAsync('motDePasse', hashedMotDePasse);

        console.log("Identifiants sécurisés enregistrés !");
      }
    };

    initialiserIdentifiants();
  }, []);

  // Fonction de connexion
  const Seconnecter = async () => {
    if (tentatives >= 5) {
      Alert.alert("Trop de tentatives échouées. Veuillez réessayer plus tard.");
      return;
    }

    const storedSalt = await SecureStore.getItemAsync('salt');
    if (!storedSalt) {
      Alert.alert("Erreur : Salt manquant. Veuillez réinitialiser l'application.");
      return;
    }

    const hashedNomUtilisateur = await hacher(nomUtilisateur, storedSalt);
    const hashedMotDePasse = await hacher(motDePasse, storedSalt);

    const storedUser = await SecureStore.getItemAsync('nomUtilisateur');
    const storedPassword = await SecureStore.getItemAsync('motDePasse');

    if (hashedNomUtilisateur === storedUser && hashedMotDePasse === storedPassword) {
      Alert.alert(`Bienvenue ${nomUtilisateur}!`);
      router.push('/affichage');
    } else {
      setTentatives(tentatives + 1);
      Alert.alert('Identifiants incorrects. Tentative échouée.');
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
