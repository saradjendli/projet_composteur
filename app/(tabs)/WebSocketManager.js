import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
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

  const initialiserWebSocket = async () => {
    console.log('[WebSocket] Initialisation...');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      console.log('[WebSocket] Ancienne connexion fermée.');
    }

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      setErreur('Non authentifié');
      console.log('[WebSocket] Aucun token trouvé');
      return;
    }

    const ws = new WebSocket('wss://api.composteur.cielnewton.fr/ws/', undefined, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connecté');
      setConnecte(true);
      setErreur(null);
    };

    ws.onmessage = (event) => {
      console.log('[WebSocket] Message reçu:', event.data);

      try {
        const donnees = JSON.parse(event.data);
        console.log(donnees)
        if (donnees.temperature !== undefined) {
          console.log('[WebSocket] Température reçue:', donnees.temperature);
          setTemperature(donnees.temperature);
        }

        if (donnees.humidite !== undefined) {
          console.log('[WebSocket] Humidité reçue:', donnees.humidite);
          setHumidite(donnees.humidite);
        }

        if (donnees.etat !== undefined) {
          console.log('[WebSocket] État de la pompe reçu:', donnees.etat);

          if (donnees.etat === "on") {
            setArrosageActif(true);
            setArrosageBloque(true);

            console.log('[WebSocket] Pompe activée ailleurs -> Blocage du bouton');

            Alert.alert(
              "Arrosage déjà en cours",
              "L'arrosage est déjà actif sur un autre appareil."
            );
          } else if (donnees.etat === "off") {
            setArrosageActif(false);
            setArrosageBloque(false);

            console.log('[WebSocket] Pompe arrêtée -> Déblocage du bouton');
          }
        }

      } catch (error) {
        console.error('[WebSocket] Erreur JSON:', error);
      }
    };

    ws.onclose = () => {
      console.log('[WebSocket] Fermé');
      setConnecte(false);
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Erreur:', error);
      setErreur('Erreur de connexion WebSocket');
    };
  };

  const envoyerMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Envoi du message:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('[WebSocket] Impossible d\'envoyer, connexion non disponible');
      setErreur('Connexion WebSocket non disponible');
    }
  };

  const basculerModeArrosageAuto = () => {
    const nouveauMode = !modeAuto;
    setModeAuto(nouveauMode);

    console.log('[WebSocket] Changement mode auto ->', nouveauMode ? 'auto' : 'manuel');

    envoyerMessage({
      mode: nouveauMode ? 'auto' : 'manuel',
    });
  };

  const basculerControleArrosage = () => {
    const nouvelEtat = !arrosageActif;
    setArrosageActif(nouvelEtat);

    console.log('[WebSocket] Changement état arrosage manuel ->', nouvelEtat ? 'on' : 'off');

    envoyerMessage({
      etat: nouvelEtat ? 'on' : 'off',
    });
  };

  useEffect(() => {
    initialiserWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log('[WebSocket] Nettoyage: Connexion fermée');
      }
    };
  }, []);

  return {
    arrosageActif,
    arrosageBloque,
    temperature,
    humidite,
    connecte,
    erreur,
    modeAuto,
    basculerControleArrosage,
    basculerModeArrosageAuto,
    envoyerMessage,
  };
};

export default utiliserGestionnaireWebSocket;
