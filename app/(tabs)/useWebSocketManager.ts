import { useState, useEffect, useRef } from 'react';

// pour gérer la connexion WebSocket sécurisé
const utiliserGestionnaireWebSocket = () => {
  const [arrosageActif, setArrosageActif] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidite, setHumidite] = useState<number | null>(null);
  const [connecte, setConnecte] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalleReconnexionRef = useRef<NodeJS.Timeout | null>(null);
  const intervallePingRef = useRef<NodeJS.Timeout | null>(null);

  const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjEwMzYyMjAwLCJleHBpcmVkIjp0cnVlfQ.RtGzTkBr5ogzyqrKmBrXdy5VoSlqF4D0V2m4dCzG8Mo";
  const URL_WSS = `wss://composteur.cielnewton.fr/api?token=${TOKEN}`;

  const initialiserWebSocket = () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(URL_WSS);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WEBSOKET CONNECTÉ');
        setConnecte(true);
        setErreur(null);

        // envoyerMessage({ type: 'etat_arrosage' });
        // envoyerMessage({ type: 'obtenir_donnees' });

        // Lancer le ping régulier toutes les 5 secondes
        if (!intervallePingRef.current) {
          intervallePingRef.current = setInterval(() => {
            envoyerMessage({ type: 'ping' });
          }, 5000);
        }
      };

      ws.onmessage = (event) => {
        try {
          console.log(event.data)
          const donnees = JSON.parse(event.data);

          // if (donnees.type === 'etat_arrosage') {
          //   setArrosageActif(donnees.state === 'on');
          // }

          // if (donnees.type === 'obtenir_donnees') {
          //   setTemperature(donnees.temperature ?? null);
          //   setHumidite(donnees.humidite ?? null);
          // }
          setTemperature(donnees.temperature ?? null);
          setHumidite(donnees.humidite ?? null);
          

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

        if (intervallePingRef.current) {
          clearInterval(intervallePingRef.current);
          intervallePingRef.current = null;
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

  const envoyerMessage = (message: Record<string, any>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
            const messageJSON = JSON.stringify(message);
            wsRef.current.send(messageJSON);
            console.log('Message envoyé au serveur sécurisé:', messageJSON);
        } catch (error) {
            console.error('Erreur lors de la conversion en JSON :', error);
            setErreur('Erreur lors de l\'envoi du message. Format invalide.');
        }
    } else {
        setErreur('Connexion WebSocket sécurisée non disponible');
    }
  };

  const basculerControleArrosage = () => {
    const nouvelEtat = !arrosageActif;
    setArrosageActif(nouvelEtat);

    envoyerMessage({
      type: 'etat_arrosage',
      state: nouvelEtat ? 'on' : 'off'
    });
  };

  const reconnecter = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    initialiserWebSocket();
  };


  useEffect(() => {
    initialiserWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (intervalleReconnexionRef.current) clearTimeout(intervalleReconnexionRef.current);
      if (intervallePingRef.current) clearInterval(intervallePingRef.current);
    };
  }, []);

  return {
    arrosageActif,
    temperature,
    humidite,
    connecte,
    erreur,
    basculerControleArrosage,
    reconnecter,
  };
};

export default utiliserGestionnaireWebSocket;
