import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView , Image} from 'react-native';
import utiliserGestionnaireWebSocket from './WebSocketManager';
import { useRouter } from 'expo-router';

const ComposteurControl: React.FC = () => {
  const { 
    arrosageActif, 
    temperature, 
    humidite, 
    erreur,
    basculerControleArrosage, 
    reconnecter 
  } = utiliserGestionnaireWebSocket();

  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Données du Compost :</Text>

      {erreur ? (
        <Text style={styles.erreur}>{erreur}</Text>
      ) : (
        <>
          {/* <Text style={styles.connectionStatus}>
            {connecte ? 'Connecté au serveur WebSocket' : 'Déconnecté'}
          </Text> */}
          <Image 
            source={require('../../assets/images/image.png')} 
            style={{ width: 300, height: 300 }} 
           />

          <Text style={styles.info}>
            Température : {temperature !== null ? `${temperature}°C` : 'Chargement...'}
          </Text>

          <Text style={styles.info}>
            Humidité : {humidite !== null ? `${humidite}%` : 'Chargement...'}
          </Text>

          <Text style={styles.info}>
            {arrosageActif ? 'Arrosage en cours' : 'Arrosage arrêté'}
          </Text>

          <TouchableOpacity 
            style={[styles.bouton, arrosageActif ? styles.boutonActif : null]} 
            onPress={basculerControleArrosage}
          >
            <Text style={styles.texteBouton}>
              {arrosageActif ? "Désactiver l'arrosage" : "Activer l'arrosage"}
            </Text>
          </TouchableOpacity>

          {/* {!connecte && (
            <TouchableOpacity style={styles.boutonReconnexion} onPress={reconnecter}>
              <Text style={styles.texteBouton}>Reconnecter</Text>
            </TouchableOpacity>
          )} */}

          {/* 🔵 Bouton pour aller voir l'historique */}
          <TouchableOpacity style={styles.boutonNavigation} onPress={() => router.push('/affichage_historique')}>
            <Text style={styles.texteBouton}>Voir l'historique</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  connectionStatus: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  erreur: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  bouton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  boutonActif: {
    backgroundColor: '#F44336',
  },
  boutonReconnexion: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  boutonNavigation: {
    backgroundColor: '#8E44AD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  texteBouton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComposteurControl;
