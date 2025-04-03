import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { utiliserGestionnaireWebSocket } from './useWebSocketManager'; 

const ComposteurControl = () => {
  const { 
    arrosageActif, 
    temperature, 
    humidite, 
    connecte, 
    erreur,
    basculerControleArrosage, 
    reconnecter 
  } = utiliserGestionnaireWebSocket();

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Données du Compost :</Text>
      
      {erreur ? (
        <Text style={styles.erreur}>{erreur}</Text>
      ) : (
        <>
          <Text style={styles.connectionStatus}>
            {connecte ? 'Connecté' : ' Déconnecté'}
          </Text>
          <Text style={styles.info}>
            Température : {temperature !== null ? `${temperature}°C` : 'Chargement...'}
          </Text>
          <Text style={styles.info}>
            Humidité : {humidite !== null ? `${humidite}%` : 'Chargement...'}
          </Text>
          <Text style={styles.info}>
            {arrosageActif ? ' Arrosage en cours' : 'Arrosage arrêté'}
          </Text>

          <TouchableOpacity 
            style={[styles.bouton, arrosageActif ? styles.boutonActif : null]} 
            onPress={basculerControleArrosage}
          >
            <Text style={styles.texteBouton}>
              {arrosageActif ? "Désactiver l'arrosage" : "Activer l'arrosage"}
            </Text>
          </TouchableOpacity>

          {!connecte && (
            <TouchableOpacity style={styles.boutonReconnexion} onPress={reconnecter}>
              <Text style={styles.texteBouton}>Reconnecter</Text>
            </TouchableOpacity>
          )}
        </>
      )}
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
  connectionStatus: {
    fontSize: 16,
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
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
    alignItems: 'center',
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
    alignItems: 'center',
  },
  texteBouton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComposteurControl;
