import { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';

const utiliserGestionnaireWebSocket = () => {
  const [arrosageActif, setArrosageActif] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [humidite, setHumidite] = useState(null);
  const [connecte, setConnecte] = useState(false);
  const [erreur, setErreur] = useState(null);

  const wsRef = useRef(null);
  const intervalleReconnexionRef = useRef(null);
  const intervallePingRef = useRef(null);

  const initialiserWebSocket = async () => {
    console.log('Initialisation du WebSocket...');

    // Fermer la connexion existante avant d'en ouvrir une nouvelle
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      console.log('Fermeture de la connexion WebSocket existante');
    }

    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
      console.error('Aucun token trouvé dans SecureStore');
      setErreur('Non authentifié');
      return;
    }

    const ws = new WebSocket('wss://api.composteur.cielnewton.fr/ws/', undefined, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connecté');
      setConnecte(true);
      setErreur(null);

      if (!intervallePingRef.current) {
        intervallePingRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('Envoi ping au serveur WebSocket');
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 58000); // ping toutes les 58 secondes
      }
    };

    ws.onmessage = (event) => {
      try {
        console.log('Message reçu du serveur WebSocket :', event.data);
        const donnees = JSON.parse(event.data);

        // Ne mettre à jour que si la valeur est présente
        if (donnees.temperature !== undefined && donnees.temperature !== null) {
          setTemperature(donnees.temperature);
        }

        if (donnees.humidite !== undefined && donnees.humidite !== null) {
          setHumidite(donnees.humidite);
        }
      } catch (error) {
        console.error('Erreur lors du traitement des données WebSocket :', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket fermé, tentative de reconnexion dans 5 secondes');
      setConnecte(false);

      if (!intervalleReconnexionRef.current) {
        intervalleReconnexionRef.current = setTimeout(initialiserWebSocket, 5000);
      }

      if (intervallePingRef.current) {
        clearInterval(intervallePingRef.current);
        intervallePingRef.current = null;
      }
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket :', error);
      setErreur('Erreur de connexion WebSocket');
    };
  };

  const envoyerMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Envoi du message au serveur WebSocket :', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('Échec de l\'envoi du message, WebSocket non disponible');
      setErreur('Connexion WebSocket non disponible');
    }
  };

  const basculerControleArrosage = () => {
    const nouvelEtat = !arrosageActif;
    setArrosageActif(nouvelEtat);

    envoyerMessage({
      capteur: 'pompe',
      etat: nouvelEtat ? 'on' : 'off',
    });
  };

  const reconnecter = () => {
    console.log('Reconnexion manuelle demandée');
    if (wsRef.current) {
      wsRef.current.close();
    }
    initialiserWebSocket();
  };

  useEffect(() => {
    initialiserWebSocket();

    return () => {
      console.log('Nettoyage du composant, fermeture du WebSocket');
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
