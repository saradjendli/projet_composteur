import React, { useEffect, useState, useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, View, Alert } from 'react-native';
import utiliserGestionnaireWebSocket from './WebSocketManager';
import { useRouter } from 'expo-router';

const ComposteurControl: React.FC = () => {
  const {
    arrosageActif,
    arrosageBloque,
    temperature,
    humidite,
    modeAuto,
    erreur,
    envoyerMessage,
    stopArrosage,
    jeControleLaPompe,
    setOnArrosageTermine,
  } = utiliserGestionnaireWebSocket();

  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [boutonsDesactives, setBoutonsDesactives] = useState<boolean>(false);
  const [tempsRestant, setTempsRestant] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [alerteVisible, setAlerteVisible] = useState(false);
  const [messageAlerte, setMessageAlerte] = useState('');

  const lancerDecompte = () => {
    let count = 15;
    setTempsRestant(count);
    setModalVisible(true);
    setBoutonsDesactives(true);

    const countdown = () => {
      if (count > 0) {
        setTimeout(() => {
          count -= 1;
          setTempsRestant(count);
          countdown();
        }, 1000);
      } else {
        setModalVisible(false);
        setTempsRestant(null);
        setBoutonsDesactives(false);
        stopArrosage();
      }
    };

    countdown();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (erreur === 'ARROSAGE_AUTRE_APPAREIL' && !modalVisible) {
      Alert.alert(
        'Pompe déjà utilisée',
        'La pompe est déjà activée depuis un autre appareil.'
      );
    }
  }, [erreur, modalVisible]);

  useEffect(() => {
    setOnArrosageTermine(() => {
      setBoutonsDesactives(false);
    });
  }, []);

  useEffect(() => {
    if (
      arrosageActif &&
      !modalVisible &&
      !boutonsDesactives &&
      jeControleLaPompe
    ) {
      // console.log('[DEBUG] Lancement du décompte car c’est moi qui ai déclenché');
      lancerDecompte();
    }
  }, [arrosageActif]);

  const handleArrosageManuel = () => {
    if (boutonsDesactives || modeAuto || arrosageActif || arrosageBloque) return;
    envoyerMessage({ etat: 'on' });
    lancerDecompte();
  };

  const handleModeAuto = () => {
    if (boutonsDesactives || arrosageActif || arrosageBloque) return;
    envoyerMessage({ mode: modeAuto ? 'manuel' : 'auto' });
  };

  const verifierCompost = () => {
    if (temperature === null || humidite === null) {
      Alert.alert("Erreur", "Les données ne sont pas disponibles pour l’instant.");
      return;
    }

    let message = '';

    if (temperature < 30) {
      message += 'Température trop basse. Ajoutez de la matière verte.\n';
    } else if (temperature > 70) {
      message += 'Température trop élevée. Retournez le compost.\n';
    }

    if (humidite < 40) {
      message += 'Humidité trop basse. Ajoutez de l’eau.\n';
    } else if (humidite > 70) {
      message += 'Humidité trop élevée. Ajoutez de la matière sèche.\n';
    }

    if (message) {
      setMessageAlerte(message);
      setAlerteVisible(true);
    } else {
      Alert.alert('Compost OK', 'Les conditions sont optimales.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titre}>Données du Compost :</Text>

        <Image
          source={require('../../assets/images/image.png')}
          style={{ width: 200, height: 200 }}
        />

        <Text style={styles.info}>
          Température : {temperature !== null ? `${temperature}°C` : 'Chargement...'}
        </Text>

        <Text style={styles.info}>
          Humidité : {humidite !== null ? `${humidite}%` : 'Chargement...'}
        </Text>

        {arrosageActif && (
          <Text style={styles.messagePompe}>
            Pompe en marche... Attendez la fin de l’arrosage.
          </Text>
        )}

        {arrosageBloque && (
          <Text style={styles.messagePompe}>
            Pompe utilisée sur un autre appareil.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.bouton,
            (boutonsDesactives || modeAuto || arrosageActif || arrosageBloque) ? styles.boutonGrise : null,
          ]}
          onPress={handleArrosageManuel}
          disabled={boutonsDesactives || modeAuto || arrosageActif || arrosageBloque}
        >
          <Text style={styles.texteBouton}>Activer l’arrosage manuel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bouton,
            modeAuto ? styles.boutonActif : null,
            (boutonsDesactives || arrosageActif || arrosageBloque) ? styles.boutonGrise : null,
          ]}
          onPress={handleModeAuto}
          disabled={boutonsDesactives || arrosageActif || arrosageBloque}
        >
          <Text style={styles.texteBouton}>
            {modeAuto ? 'Désactiver le mode automatique' : 'Activer le mode automatique'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
           style={[styles.bouton, styles.boutonVert]}
          onPress={verifierCompost}
        >
          <Text style={styles.texteBouton}>Vérification du compost</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonNavigation}
          onPress={() => router.push('/affichage_historique')}
        >
          <Text style={styles.texteBouton}>Consulter l'historique</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Arrosage manuel</Text>
            <Text style={styles.modalTimer}>
              La pompe s’arrêtera dans {tempsRestant}s
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={alerteVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAlerteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alerte compost</Text>
            <Text style={styles.modalTimer}>{messageAlerte}</Text>
            <TouchableOpacity
              onPress={() => setAlerteVisible(false)}
              style={[styles.bouton, { marginTop: 20 }]}
            >
              <Text style={styles.texteBouton}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
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
  messagePompe: {
    fontSize: 16,
    color: '#0077B6',
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  bouton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },

boutonVert: {
  backgroundColor: 'green',
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
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTimer: {
    fontSize: 18,
    color: '#2E86AB',
    textAlign: 'center',
  },
});

export default ComposteurControl;








// import React, { useEffect, useState, useRef } from 'react';
// import {Text,TouchableOpacity,StyleSheet,ScrollView,Image,Modal,View,Alert,} from 'react-native';
// import utiliserGestionnaireWebSocket from './WebSocketManager';
// import { useRouter } from 'expo-router';

// const ComposteurControl: React.FC = () => {
//   const {
//     arrosageActif,
//     arrosageBloque,
//     temperature,
//     humidite,
//     modeAuto,
//     erreur,
//     envoyerMessage,
//     stopArrosage,
//     jeControleLaPompe,
//     setOnArrosageTermine, 

//   } = utiliserGestionnaireWebSocket(); 

//   const router = useRouter();  // appelles le hook useRouter(), et que tu récupères dans la variable router
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


//   const [boutonsDesactives, setBoutonsDesactives] = useState<boolean>(false);
//   const [tempsRestant, setTempsRestant] = useState<number | null>(null);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);


// const lancerDecompte = () => {
//   let count = 15;
//   setTempsRestant(count);
//   setModalVisible(true);
//   setBoutonsDesactives(true);

//   const countdown = () => {
//     if (count > 0) {
//       setTimeout(() => {
//         count -= 1;
//         setTempsRestant(count);
//         countdown();
//       }, 1000);
//     } else {
//       setModalVisible(false);
//       setTempsRestant(null);
//       setBoutonsDesactives(false);
//       stopArrosage();
//     }
//   };

//   countdown();
// };



//   useEffect(() => {
//     return () => {
//       if (intervalRef.current !== null) clearInterval(intervalRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     if (erreur === 'ARROSAGE_AUTRE_APPAREIL' && !modalVisible) {
//       Alert.alert(
//         'Pompe déjà utilisée',
//         'La pompe est déjà activée depuis un autre appareil.'
//       );
//     }
//   }, [erreur, modalVisible]);
  
//   useEffect(() => {
//   setOnArrosageTermine(() => {
//     setBoutonsDesactives(false); //  Réactive les boutons
//   });
// }, []);


//   useEffect(() => {
//   if (
//     arrosageActif &&
//     !modalVisible &&
//     !boutonsDesactives &&
//     jeControleLaPompe 
//   ) {
//     console.log('[DEBUG] Lancement du décompte car c’est moi qui ai déclenché');
//     lancerDecompte();
//   }
// }, [arrosageActif]);


//   const handleArrosageManuel = () => {
//     if (boutonsDesactives || modeAuto || arrosageActif || arrosageBloque) return;
//     envoyerMessage({ etat: 'on' });
//     lancerDecompte();
//   };

//   const handleModeAuto = () => {
//     if (boutonsDesactives || arrosageActif || arrosageBloque) return;
//     envoyerMessage({ mode: modeAuto ? 'manuel' : 'auto' });
//   };

//   return (
//     <>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.titre}>Données du Compost :</Text>

//         <Image
//           source={require('../../assets/images/image.png')}
//           style={{ width: 200, height: 200 }}
//         />

//         <Text style={styles.info}>
//           Température : {temperature !== null ? `${temperature}°C` : 'Chargement...'}
//         </Text>

//         <Text style={styles.info}>
//           Humidité : {humidite !== null ? `${humidite}%` : 'Chargement...'}
//         </Text>

//         {arrosageActif && (
//           <Text style={styles.messagePompe}>
//             Pompe en marche... Attendez la fin de l’arrosage.
//           </Text>
//         )}

//         {arrosageBloque && (
//           <Text style={styles.messagePompe}>
//             Pompe utilisée sur un autre appareil.
//           </Text>
//         )}

//         <TouchableOpacity
//           style={[
//             styles.bouton,
//             (boutonsDesactives || modeAuto || arrosageActif || arrosageBloque) ? styles.boutonGrise : null,
//           ]}
//           onPress={handleArrosageManuel}
//           disabled={boutonsDesactives || modeAuto || arrosageActif || arrosageBloque}
//         >
//           <Text style={styles.texteBouton}>Activer l’arrosage manuel</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.bouton,
//             modeAuto ? styles.boutonActif : null,
//             (boutonsDesactives || arrosageActif || arrosageBloque) ? styles.boutonGrise : null,
//           ]}
//           onPress={handleModeAuto}
//           disabled={boutonsDesactives || arrosageActif || arrosageBloque}
//         >
//           <Text style={styles.texteBouton}>
//             {modeAuto ? 'Désactiver le mode automatique' : 'Activer le mode automatique'}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.boutonNavigation}
//           onPress={() => router.push('/affichage_historique')}
//         >
//           <Text style={styles.texteBouton}>Consulter l'historique</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => {}}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Arrosage manuel</Text>
//             <Text style={styles.modalTimer}>
//               La pompe s’arrêtera dans {tempsRestant}s
//             </Text>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: 'white',
//   },
//   titre: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   info: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   messagePompe: {
//     fontSize: 16,
//     color: '#0077B6',
//     fontWeight: 'bold',
//     marginVertical: 10,
//     textAlign: 'center',
//   },
//   bouton: {
//     backgroundColor: '#2196F3',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   boutonActif: {
//     backgroundColor: '#F44336',
//   },
//   boutonGrise: {
//     backgroundColor: '#A9A9A9',
//   },
//   boutonNavigation: {
//     backgroundColor: '#8E44AD',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   texteBouton: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 30,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   modalTimer: {
//     fontSize: 18,
//     color: '#2E86AB',
//   },
// });

// export default ComposteurControl;
