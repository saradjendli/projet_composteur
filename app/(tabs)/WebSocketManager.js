import { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const utiliserGestionnaireWebSocket = () => {
  // États React pour suivre l'état de l'application
  const [arrosageActif, setArrosageActif] = useState(false); // Si la pompe est active
  const [arrosageBloque, setArrosageBloque] = useState(false); // Si un autre appareil contrôle la pompe
  const [temperature, setTemperature] = useState(null); // Température actuelle
  const [humidite, setHumidite] = useState(null); // Humidité actuelle
  const [connecte, setConnecte] = useState(false); // Statut de connexion WebSocket
  const [erreur, setErreur] = useState(null); // Message d'erreur éventuel
  const [modeAuto, setModeAuto] = useState(false); // Mode auto activé ou non
  const [historique, setHistorique] = useState([]); // Historique des états d'arrosage

  //setter=mutateur ou manipulateur


  // Références persistantes entre les rendus
  const wsRef = useRef(null); // Référence à l'instance WebSocket
  const jeControleLaPompe = useRef(false); // Permet de savoir si l'appareil a lancé l'arrosage
  const derniereDemandeMode = useRef(null); // Mémorise le dernier mode demandé (auto ou manuel)

  // Références aux valeurs en temps réel
  const temperatureRef = useRef(null);
  const humiditeRef = useRef(null);
  const arrosageActifRef = useRef(false);
  const arrosageBloqueRef = useRef(false);

  // Référence à une fonction callback appelée à la fin de l'arrosage
  const onArrosageTermineRef = useRef(null); 

  // Sauvegarde l'état d'arrosage dans le stockage local (max 50 éléments)
  const sauvegarderHistorique = async (etat) => {
    const nouveau = [...historique, etat].slice(-50);
    setHistorique(nouveau);
    await AsyncStorage.setItem('historiqueArrosage', JSON.stringify(nouveau));
  };

  // Sauvegarde du mode automatique dans le stockage local
  const sauvegarderModeAuto = async (valeur) => {
    setModeAuto(valeur);
    await AsyncStorage.setItem('modeAuto', JSON.stringify(valeur));
  };

  // Chargement de l'historique depuis le stockage local
  const chargerHistorique = async () => {
    try {
      const data = await AsyncStorage.getItem('historiqueArrosage');
      if (data) {
        const parsed = JSON.parse(data);
        console.log('[DEBUG] Historique trouvé :', parsed);
        setHistorique(parsed);

        const dernier = parsed[parsed.length - 1];
        if (dernier) {
          console.log('[DEBUG] Dernier état actif :', dernier.actif);
          setArrosageActif(dernier.actif);
          arrosageActifRef.current = dernier.actif;
        }
      } else {
        console.log('[DEBUG] Aucun historique trouvé');
      }
    } catch (err) {
      console.log('[ERREUR] Lecture historique échouée', err);
    }
  };

  // Chargement du mode automatique s'il était déja mit en place
  const chargerModeAuto = async () => {
    try {
      const data = await AsyncStorage.getItem('modeAuto');
      if (data !== null) {
        const valeur = JSON.parse(data);
        console.log('[DEBUG] Mode auto restauré :', valeur);
        setModeAuto(valeur);
      }
    } catch (err) {
      console.log('[ERREUR] Lecture modeAuto échouée', err);
    }
  };

  // Initialisation de la connexion WebSocket
  const initialiserWebSocket = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      setErreur('Non authentifié');
      return;
    }

    const ws = new WebSocket('wss://api.composteur.cielnewton.fr/ws/', undefined, {
      headers: { Authorization: `Bearer ${token}` },
    });

    wsRef.current = ws;

    ws.onopen = () => {
      setConnecte(true);
      setErreur(null);
      if (temperatureRef.current !== null) setTemperature(temperatureRef.current);
      if (humiditeRef.current !== null) setHumidite(humiditeRef.current);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data)

        if (data.temperature !== undefined) {
          temperatureRef.current = data.temperature;
          setTemperature(data.temperature);
        }

        if (data.humidite !== undefined) {
          humiditeRef.current = data.humidite;
          setHumidite(data.humidite);
        }

        if (data.etat !== undefined) {
          const estActif = data.etat === 'on';
          const nouvelEtat = {
            date: Date.now(),
            actif: estActif,
          };
     

          await sauvegarderHistorique(nouvelEtat);

          setArrosageActif(estActif);
          arrosageActifRef.current = estActif;

          if (estActif) {
            const cEstMoi = jeControleLaPompe.current;
            const bloque = !cEstMoi;
            setArrosageBloque(bloque);
            arrosageBloqueRef.current = bloque;
            if (!cEstMoi) setErreur('ARROSAGE_AUTRE_APPAREIL');
          } else {
            setArrosageBloque(false);
            arrosageBloqueRef.current = false;
            setErreur(null);

            if (typeof onArrosageTermineRef.current === 'function') {
              onArrosageTermineRef.current();
            }
          }

          jeControleLaPompe.current = false;
        }

        if (data.mode !== undefined) {
          const nouveauMode = data.mode === 'auto';

          if (
            (derniereDemandeMode.current === 'auto' && nouveauMode === true) ||
            (derniereDemandeMode.current === 'manuel' && nouveauMode === false)
          ) {
            await sauvegarderModeAuto(nouveauMode);
            derniereDemandeMode.current = null;
          } else {
            console.log(`[INFO] mode ${data.mode} activé par une autre personne`);
            await sauvegarderModeAuto(nouveauMode);
            derniereDemandeMode.current = null;
          }
        }

      } catch (error) {
        console.error('[WebSocket] Erreur JSON:', error);
      }
    };

    ws.onclose = () => setConnecte(false);
    ws.onerror = () => setErreur('Erreur de connexion WebSocket');
  };

  // Envoi d'un message WebSocket au serveur
  const envoyerMessage = (message) => {
    if (message.etat === 'on') {
      jeControleLaPompe.current = true;
    }

    if (message.mode) {
      derniereDemandeMode.current = message.mode;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setErreur('Connexion WebSocket non disponible');
    }
  };

  // Fonction pour arrêter manuellement l’arrosage
  const stopArrosage = async () => {
    setArrosageActif(false);
    setArrosageBloque(false);
    arrosageActifRef.current = false;
    arrosageBloqueRef.current = false;
    envoyerMessage({ etat: 'off' });

    const nouvelEtat = {
      date: Date.now(),
      actif: false,
    };

    await sauvegarderHistorique(nouvelEtat);
  };

  // Initialisation du hook au montage du composant
  useEffect(() => {
    chargerHistorique();
    chargerModeAuto();
    initialiserWebSocket();
    return () => wsRef.current?.close(); // Fermeture propre de la socket
  }, []);

  // Valeurs retournées par le hook pour usage externe
  return {
    arrosageActif,
    arrosageBloque,
    temperature,
    humidite,
    connecte,
    erreur,
    modeAuto,
    envoyerMessage,
    stopArrosage,
    historique,
    jeControleLaPompe: jeControleLaPompe.current,
    setOnArrosageTermine: (cb) => {
      onArrosageTermineRef.current = cb;
    }
  };
};

export default utiliserGestionnaireWebSocket;



// import { useState, useEffect, useRef } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const utiliserGestionnaireWebSocket = () => {
//   const [arrosageActif, setArrosageActif] = useState(false);
//   const [arrosageBloque, setArrosageBloque] = useState(false);
//   const [temperature, setTemperature] = useState(null);
//   const [humidite, setHumidite] = useState(null);
//   const [connecte, setConnecte] = useState(false);
//   const [erreur, setErreur] = useState(null);
//   const [modeAuto, setModeAuto] = useState(false);
//   const [historique, setHistorique] = useState([]);

//   const wsRef = useRef(null);
//   const jeControleLaPompe = useRef(false);
//   const derniereDemandeMode = useRef(null);

//   const temperatureRef = useRef(null);
//   const humiditeRef = useRef(null);
//   const arrosageActifRef = useRef(false);
//   const arrosageBloqueRef = useRef(false);

//   const onArrosageTermineRef = useRef(null);

//   const sauvegarderHistorique = async (etat) => {
//     const nouveau = [...historique, etat].slice(-50);
//     setHistorique(nouveau);
//     await AsyncStorage.setItem('historiqueArrosage', JSON.stringify(nouveau));
//   };

//   const sauvegarderModeAuto = async (valeur) => {
//     setModeAuto(valeur);
//     await AsyncStorage.setItem('modeAuto', JSON.stringify(valeur));
//   };

//   const chargerHistorique = async () => {
//     try {
//       const data = await AsyncStorage.getItem('historiqueArrosage');
//       if (data) {
//         const parsed = JSON.parse(data);
//         console.log('[DEBUG] Historique trouvé :', parsed);
//         setHistorique(parsed);

//         const dernier = parsed[parsed.length - 1];
//         if (dernier) {
//           console.log('[DEBUG] Dernier état actif :', dernier.actif);
//           setArrosageActif(dernier.actif);
//           arrosageActifRef.current = dernier.actif;
//         }
//       } else {
//         console.log('[DEBUG] Aucun historique trouvé');
//       }
//     } catch (err) {
//       console.log('[ERREUR] Lecture historique échouée', err);
//     }
//   };

//   const chargerModeAuto = async () => {
//     try {
//       const data = await AsyncStorage.getItem('modeAuto');
//       if (data !== null) {
//         const valeur = JSON.parse(data);
//         console.log('[DEBUG] Mode auto restauré :', valeur);
//         setModeAuto(valeur);
//       }
//     } catch (err) {
//       console.log('[ERREUR] Lecture modeAuto échouée', err);
//     }
//   };

//   const initialiserWebSocket = async () => {
//     const token = await SecureStore.getItemAsync('userToken');
//     if (!token) {
//       setErreur('Non authentifié');
//       return;
//     }

//     const ws = new WebSocket('wss://api.composteur.cielnewton.fr/ws/', undefined, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     wsRef.current = ws;

//     ws.onopen = () => {
//       setConnecte(true);
//       setErreur(null);
//       if (temperatureRef.current !== null) setTemperature(temperatureRef.current);
//       if (humiditeRef.current !== null) setHumidite(humiditeRef.current);
//     };

//     ws.onmessage = async (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log(data);

//         if (data.temperature !== undefined) {
//           temperatureRef.current = data.temperature;
//           setTemperature(data.temperature);
//         }

//         if (data.humidite !== undefined) {
//           humiditeRef.current = data.humidite;
//           setHumidite(data.humidite);
//         }

//         if (data.etat !== undefined) {
//           const estActif = data.etat === 'on';
//           const timestamp = Date.now();
//           const dateLisible = new Date(timestamp).toLocaleString('fr-FR', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//           });

//           const nouvelEtat = {
//             date: timestamp,
//             dateLisible: dateLisible,
//             actif: estActif,
//           };

//           await sauvegarderHistorique(nouvelEtat);

//           setArrosageActif(estActif);
//           arrosageActifRef.current = estActif;

//           if (estActif) {
//             const cEstMoi = jeControleLaPompe.current;
//             const bloque = !cEstMoi;
//             setArrosageBloque(bloque);
//             arrosageBloqueRef.current = bloque;
//             if (!cEstMoi) setErreur('ARROSAGE_AUTRE_APPAREIL');
//           } else {
//             setArrosageBloque(false);
//             arrosageBloqueRef.current = false;
//             setErreur(null);
//             if (typeof onArrosageTermineRef.current === 'function') {
//               onArrosageTermineRef.current();
//             }
//           }

//           jeControleLaPompe.current = false;
//         }

//         if (data.mode !== undefined) {
//           const nouveauMode = data.mode === 'auto';
//           if (
//             (derniereDemandeMode.current === 'auto' && nouveauMode === true) ||
//             (derniereDemandeMode.current === 'manuel' && nouveauMode === false)
//           ) {
//             await sauvegarderModeAuto(nouveauMode);
//             derniereDemandeMode.current = null;
//           } else {
//             console.log(`[INFO] mode ${data.mode} activé par une autre personne`);
//             await sauvegarderModeAuto(nouveauMode);
//             derniereDemandeMode.current = null;
//           }
//         }
//       } catch (error) {
//         console.error('[WebSocket] Erreur JSON:', error);
//       }
//     };

//     ws.onclose = () => setConnecte(false);
//     ws.onerror = () => setErreur('Erreur de connexion WebSocket');
//   };

//   const envoyerMessage = (message) => {
//     if (message.etat === 'on') {
//       jeControleLaPompe.current = true;
//     }

//     if (message.mode) {
//       derniereDemandeMode.current = message.mode;
//     }

//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(message));
//     } else {
//       setErreur('Connexion WebSocket non disponible');
//     }
//   };

//   const stopArrosage = async () => {
//     setArrosageActif(false);
//     setArrosageBloque(false);
//     arrosageActifRef.current = false;
//     arrosageBloqueRef.current = false;
//     envoyerMessage({ etat: 'off' });

//     const nouvelEtat = {
//       date: Date.now(),
//       actif: false,
//     };

//     await sauvegarderHistorique(nouvelEtat);
//   };

//   useEffect(() => {
//     chargerHistorique();
//     chargerModeAuto();
//     initialiserWebSocket();
//     return () => wsRef.current?.close();
//   }, []);

//   return {
//     arrosageActif,
//     arrosageBloque,
//     temperature,
//     humidite,
//     connecte,
//     erreur,
//     modeAuto,
//     envoyerMessage,
//     stopArrosage,
//     historique,
//     jeControleLaPompe: jeControleLaPompe.current,
//     setOnArrosageTermine: (cb) => {
//       onArrosageTermineRef.current = cb;
//     },
//   };
// };

// export default utiliserGestionnaireWebSocket;
