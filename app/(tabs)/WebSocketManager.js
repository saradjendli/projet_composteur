import { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';

const utiliserGestionnaireWebSocket = () => {
  const [arrosageActif, setArrosageActif] = useState(false);
  const [arrosageBloque, setArrosageBloque] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [humidite, setHumidite] = useState(null);
  const [connecte, setConnecte] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [modeAuto, setModeAuto] = useState(false);

  const wsRef = useRef(null);
  const jeControleLaPompe = useRef(false);

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
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.temperature !== undefined) setTemperature(data.temperature);
        if (data.humidite !== undefined) setHumidite(data.humidite);

        // ✅ gestion propre de l'état "on" ou "off"
        if (data.etat !== undefined) {
          const cEstMoi = jeControleLaPompe.current;

          if (data.etat === 'on') {
            setArrosageActif(true);
            setArrosageBloque(!cEstMoi);

            if (!cEstMoi) {
              setErreur('ARROSAGE_AUTRE_APPAREIL');
            }

            jeControleLaPompe.current = false;
          }

          if (data.etat === 'off') {
            setArrosageActif(false);
            setArrosageBloque(false);
            setErreur(null);
            jeControleLaPompe.current = false;
          }
        }

        if (data.mode !== undefined) {
          setModeAuto(data.mode === 'auto');
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

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setErreur('Connexion WebSocket non disponible');
    }
  };

  // const basculerModeArrosageAuto = () => {
  //   const nouveauMode = !modeAuto;
  //   setModeAuto(nouveauMode);
  //   envoyerMessage({ mode: nouveauMode ? 'auto' : 'manuel' });
  // };

  // const basculerControleArrosage = () => {
  //   const nouvelEtat = !arrosageActif;
  //   setArrosageActif(nouvelEtat);
  //   if (nouvelEtat === true) jeControleLaPompe.current = true;
  //   envoyerMessage({ etat: nouvelEtat ? 'on' : 'off' });
  // };

  const stopArrosage = () => {
    setArrosageActif(false);
    setArrosageBloque(false);
    envoyerMessage({ etat: 'off' });
  };

  useEffect(() => {
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
    // basculerControleArrosage,
    // basculerModeArrosageAuto,
    envoyerMessage,
    stopArrosage,
  };
};

export default utiliserGestionnaireWebSocket;
