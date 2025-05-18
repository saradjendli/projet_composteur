// import { useState, useEffect, useRef } from 'react';
// import * as SecureStore from 'expo-secure-store';

// const utiliserGestionnaireWebSocket = () => {
//   const [arrosageActif, setArrosageActif] = useState(false);
//   const [arrosageBloque, setArrosageBloque] = useState(false);
//   const [temperature, setTemperature] = useState(null);
//   const [humidite, setHumidite] = useState(null);
//   const [connecte, setConnecte] = useState(false);
//   const [erreur, setErreur] = useState(null);
//   const [modeAuto, setModeAuto] = useState(false);

//   const wsRef = useRef(null);
//   const jeControleLaPompe = useRef(false);s

//   // Références persistantes des dernières valeurs reçues
//   const temperatureRef = useRef(null);
//   const humiditeRef = useRef(null);

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

//       // Restaure les dernières valeurs connues
//       if (temperatureRef.current !== null) setTemperature(temperatureRef.current);
//       if (humiditeRef.current !== null) setHumidite(humiditeRef.current);
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);

//         if (data.temperature !== undefined) {
//           temperatureRef.current = data.temperature;
//           setTemperature(data.temperature);
//         }

//         if (data.humidite !== undefined) {
//           humiditeRef.current = data.humidite;
//           setHumidite(data.humidite);
//         }

//         if (data.etat !== undefined) {
//           const cEstMoi = jeControleLaPompe.current;

//           if (data.etat === 'on') {
//             setArrosageActif(true);
//             setArrosageBloque(!cEstMoi);
//             if (!cEstMoi) setErreur('ARROSAGE_AUTRE_APPAREIL');
//             jeControleLaPompe.current = false;
//           }

//           if (data.etat === 'off') {
//             setArrosageActif(false);
//             setArrosageBloque(false);
//             setErreur(null);
//             jeControleLaPompe.current = false;
//           }
//         }

//         if (data.mode !== undefined) {
//           setModeAuto(data.mode === 'auto');
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

//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(message));
//     } else {
//       setErreur('Connexion WebSocket non disponible');
//     }
//   };

//   const stopArrosage = () => {
//     setArrosageActif(false);
//     setArrosageBloque(false);
//     envoyerMessage({ etat: 'off' });
//   };

//   useEffect(() => {
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
//   };
// };

// export default utiliserGestionnaireWebSocket;

//-------------------------------------------------------------------------------
// import { useState, useEffect, useRef } from 'react';
// import * as SecureStore from 'expo-secure-store';

// const utiliserGestionnaireWebSocket = () => {
//   const [arrosageActif, setArrosageActif] = useState(false);
//   const [arrosageBloque, setArrosageBloque] = useState(false);
//   const [temperature, setTemperature] = useState(null);
//   const [humidite, setHumidite] = useState(null);
//   const [connecte, setConnecte] = useState(false);
//   const [erreur, setErreur] = useState(null);
//   const [modeAuto, setModeAuto] = useState(false);

//   const wsRef = useRef(null);
//   const jeControleLaPompe = useRef(false);

//   // Références persistantes
//   const temperatureRef = useRef(null);
//   const humiditeRef = useRef(null);
//   const arrosageActifRef = useRef(false);
//   const arrosageBloqueRef = useRef(false);

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

//       // Restaurer tous les états persistés
//       if (temperatureRef.current !== null) setTemperature(temperatureRef.current);
//       if (humiditeRef.current !== null) setHumidite(humiditeRef.current);
//       setArrosageActif(arrosageActifRef.current);
//       setArrosageBloque(arrosageBloqueRef.current);
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);

//         if (data.temperature !== undefined) {
//           temperatureRef.current = data.temperature;
//           setTemperature(data.temperature);
//         }

//         if (data.humidite !== undefined) {
//           humiditeRef.current = data.humidite;
//           setHumidite(data.humidite);
//         }

//         if (data.etat !== undefined) {
//           const cEstMoi = jeControleLaPompe.current;

//           if (data.etat === 'on') {
//             setArrosageActif(true);
//             arrosageActifRef.current = true;

//             const bloque = !cEstMoi;
//             setArrosageBloque(bloque);
//             arrosageBloqueRef.current = bloque;

//             if (!cEstMoi) setErreur('ARROSAGE_AUTRE_APPAREIL');
//             jeControleLaPompe.current = false;
//           }

//           if (data.etat === 'off') {
//             setArrosageActif(false);
//             arrosageActifRef.current = false;

//             setArrosageBloque(false);
//             arrosageBloqueRef.current = false;

//             setErreur(null);
//             jeControleLaPompe.current = false;
//           }
//         }

//         if (data.mode !== undefined) {
//           setModeAuto(data.mode === 'auto');
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

//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(message));
//     } else {
//       setErreur('Connexion WebSocket non disponible');
//     }
//   };

//   const stopArrosage = () => {
//     setArrosageActif(false);
//     setArrosageBloque(false);
//     arrosageActifRef.current = false;
//     arrosageBloqueRef.current = false;
//     envoyerMessage({ etat: 'off' });
//   };

//   useEffect(() => {
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
//   };
// };

// export default utiliserGestionnaireWebSocket;

//----------------------------------------------------------------------------------
import { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const utiliserGestionnaireWebSocket = () => {
  const [arrosageActif, setArrosageActif] = useState(false);
  const [arrosageBloque, setArrosageBloque] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [humidite, setHumidite] = useState(null);
  const [connecte, setConnecte] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [modeAuto, setModeAuto] = useState(false);
  const [historique, setHistorique] = useState([]);

  const wsRef = useRef(null);
  const jeControleLaPompe = useRef(false);
  const derniereDemandeMode = useRef(null);

  const temperatureRef = useRef(null);
  const humiditeRef = useRef(null);
  const arrosageActifRef = useRef(false);
  const arrosageBloqueRef = useRef(false);

  const sauvegarderHistorique = async (etat) => {
    const nouveau = [...historique, etat].slice(-50);
    setHistorique(nouveau);
    await AsyncStorage.setItem('historiqueArrosage', JSON.stringify(nouveau));
  };

  const sauvegarderModeAuto = async (valeur) => {
    setModeAuto(valeur);
    await AsyncStorage.setItem('modeAuto', JSON.stringify(valeur));
  };

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
          }

          jeControleLaPompe.current = false;
        }

        if (data.mode !== undefined) {
          const nouveauMode = data.mode === 'auto';

          if (
            (derniereDemandeMode.current === 'auto' && nouveauMode === true) ||
            (derniereDemandeMode.current === 'manuel' && nouveauMode === false) ||
            derniereDemandeMode.current === null
          ) {
            await sauvegarderModeAuto(nouveauMode);
            derniereDemandeMode.current = null;
          } else {
            console.log('[DEBUG] Ignoré : réponse inattendue du serveur', data.mode);
          }
        }

      } catch (error) {
        console.error('[WebSocket] Erreur JSON:', error);
      }
    };

    ws.onclose = () => setConnecte(false);
    ws.onerror = () => setErreur('Erreur de connexion WebSocket');
  };

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

  useEffect(() => {
    chargerHistorique();
    chargerModeAuto();
    initialiserWebSocket();
    return () => wsRef.current?.close();
  }, []);

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
  };
};

export default utiliserGestionnaireWebSocket;
