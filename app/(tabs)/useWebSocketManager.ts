import { useState, useEffect, useRef } from 'react';

// Hook personnalisé pour gérer la connexion WebSocket
const utiliserGestionnaireWebSocket = () => {
  const [arrosageActif, setArrosageActif] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidite, setHumidite] = useState<number | null>(null);
  const [connecte, setConnecte] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalleReconnexionRef = useRef<NodeJS.Timeout | null>(null);

  const URL_WSS = 'wss://composteur.cielnewton.fr/api'; // URL WebSocket sécurisée
  const AUTH_TOKEN = 'cfcb8f3d66d99c299d02f049baa49661e2b45e2f56d3ce82749aacfbf39771e9';

  const initialiserWebSocket = () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const wsUrlAvecToken = `${URL_WSS}?token=${AUTH_TOKEN}`;
      const ws = new WebSocket(wsUrlAvecToken);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connexion WebSocket établie');
        setConnecte(true);
        setErreur(null);

        if (intervalleReconnexionRef.current) {
          clearInterval(intervalleReconnexionRef.current);
          intervalleReconnexionRef.current = null;
        }

        // Une fois la connexion établie, tu peux envoyer des messages
        envoyerMessage({ type: 'get_water_state' });
      };

      ws.onmessage = (event) => {
        try {
          const donnees = JSON.parse(event.data);

          // Traitement des données reçues
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
        console.error('Erreur WebSocket:', error);
        setErreur('Erreur de connexion WebSocket');
        ws.close();
      };
    } catch (error) {
      console.error('Exception lors de l\'initialisation WebSocket:', error);
      setErreur('Erreur de connexion WebSocket');
    }
  };

  const envoyerMessage = (message: any) => {
    // Vérification de l'état de la connexion WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setErreur('Connexion WebSocket non disponible');
      console.error('Impossible d\'envoyer le message, WebSocket non connecté');
    }
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
    envoyerMessage, // Assure-toi d'exposer cette fonction si nécessaire
  };
};

export default utiliserGestionnaireWebSocket;
