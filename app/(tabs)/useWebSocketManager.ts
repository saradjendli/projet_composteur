import { useState, useEffect, useRef } from 'react';

// Hook personnalisé pour gérer la connexion WebSocket sécurisé
const utiliserGestionnaireWebSocket = () => {
  const [arrosageActif, setArrosageActif] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidite, setHumidite] = useState<number | null>(null);
  const [connecte, setConnecte] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalleReconnexionRef = useRef<NodeJS.Timeout | null>(null);

  const URL_WSS = `wss://composteur.cielnewton.fr/api`; // Utiliser `wss://`

  const initialiserWebSocket = () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(URL_WSS);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connexion WebSocket sécurisée établie');
        setConnecte(true);
        setErreur(null);

        envoyerMessage({ type: 'get_water_state' });
        envoyerMessage({ type: 'get_data' });
      };

      ws.onmessage = (event) => {
        try {
          const donnees = JSON.parse(event.data);

          if (donnees.type === 'water_state') {
            setArrosageActif(donnees.state === 'on');
          }

          if (donnees.type === 'data') {
            setTemperature(donnees.temperature ?? null);
            setHumidite(donnees.humidity ?? null);
          }

        } catch (error) {
          console.error('Erreur lors du traitement des données WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('Connexion WebSocket fermée.');
        setConnecte(false);

        console.log('Tentative de reconnexion dans 5 secondes...');
        if (!intervalleReconnexionRef.current) {
          intervalleReconnexionRef.current = setTimeout(() => {
            initialiserWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket sécurisée:', error);
        setErreur('Erreur de connexion WebSocket sécurisée');
      };
    } catch (error) {
      console.error('Exception lors de l\'initialisation WebSocket sécurisée:', error);
      setErreur('Erreur de connexion WebSocket sécurisée');
    }
  };

  const envoyerMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('Message envoyé au serveur sécurisé:', JSON.stringify(message));
    } else {
      setErreur('Connexion WebSocket sécurisée non disponible');
    }
  };

  // ✅ Fonction pour contrôler l'arrosage
  const basculerControleArrosage = () => {
    const nouvelEtat = !arrosageActif;
    setArrosageActif(nouvelEtat);

    envoyerMessage({
      type: 'set_water_state',
      state: nouvelEtat ? 'on' : 'off'
    });
  };

  // ✅ Fonction pour reconnecter manuellement
  const reconnecter = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    initialiserWebSocket();
  };

  useEffect(() => {
    initialiserWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      if (intervalleReconnexionRef.current) {
        clearTimeout(intervalleReconnexionRef.current);
      }
    };
  }, []);

  return {
    arrosageActif,
    temperature,
    humidite,
    connecte,
    erreur,
    basculerControleArrosage,
    reconnecter
  };
};

export default utiliserGestionnaireWebSocket;
