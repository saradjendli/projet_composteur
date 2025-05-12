import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import utiliserGestionnaireWebSocket from './WebSocketManager';
import { useRouter } from 'expo-router';

const ComposteurControl: React.FC = () => {
  const {
    arrosageActif,
    arrosageBloque,
    temperature,
    humidite,
    erreur,
    modeAuto,
    basculerControleArrosage,
    basculerModeArrosageAuto,
  } = utiliserGestionnaireWebSocket();

  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Données du Compost :</Text>

      <Image source={require('../../assets/images/image.png')} style={{ width: 200, height: 200 }} />

      {erreur ? (
        <Text style={styles.erreur}>{erreur}</Text>
      ) : (
        <>
          <Text style={styles.info}>
            Température : {temperature !== null ? `${temperature}°C` : 'Chargement...'}
          </Text>

          <Text style={styles.info}>
            Humidité : {humidite !== null ? `${humidite}%` : 'Chargement...'}
          </Text>

          {modeAuto && (
            <Text style={[styles.info, { fontStyle: 'italic', color: '#2E86AB' }]}>
              Mode automatique activé
            </Text>
          )}

          {!modeAuto && (
            <TouchableOpacity
              style={[
                styles.bouton,
                arrosageBloque ? styles.boutonGrise : null, // Grisé si bloqué
                arrosageActif && !arrosageBloque ? styles.boutonActif : null, // Rouge si actif par toi
              ]}
              onPress={basculerControleArrosage}
              disabled={arrosageBloque}
            >
              <Text style={styles.texteBouton}>
                {arrosageBloque
                  ? "Arrosage en cours ailleurs"
                  : arrosageActif
                  ? "Désactiver l'arrosage manuel"
                  : "Activer l'arrosage manuel"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.bouton, modeAuto ? styles.boutonActif : null]}
            onPress={basculerModeArrosageAuto}
          >
            <Text style={styles.texteBouton}>
              {modeAuto ? 'Désactiver le mode automatique' : 'Activer le mode automatique'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boutonNavigation}
            onPress={() => router.push('/affichage_historique')}
          >
            <Text style={styles.texteBouton}>Consulter l'historique</Text>
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
  boutonGrise: {
    backgroundColor: '#A9A9A9',
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
