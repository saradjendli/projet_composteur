import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

type DonneeCapteur = {
  temperature: number;
  humidite: number;
  _time: string;
};

const HistoriqueCompost = () => {
  const [periode, setPeriode] = useState('');
  const [donnees, setDonnees] = useState<DonneeCapteur[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          console.error('Token manquant');
          return;
        }

        const response = await fetch(`https://api.composteur.cielnewton.fr/${periode}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur API : ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
        const dataFiltered = data.filter(
          (d: DonneeCapteur) => d.temperature < 100 && d.humidite <= 100
        );
        setDonnees(dataFiltered);
      } catch (error) {
        console.error('Erreur API:', error);
      }
    }

    if (periode) {
      fetchData();
    }
  }, [periode]);

    const formaterDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);

    switch (periode) {
      case 'month':
        return date.toLocaleDateString('fr-FR', { month: 'long' }); // met le mois
      case 'week':
        return date.toLocaleDateString('fr-FR', { weekday: 'short' }); // met les jours
      case 'day':
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // met les heures
    }
  };

  const donneesTransformees = donnees
    .sort((a, b) => new Date(a._time).getTime() - new Date(b._time).getTime())
    .map((item) => ({
      date: item._time,
      temperature: item.temperature,
      humidite: item.humidite,
    }));

  const labels = donneesTransformees.map((d, i) =>
    i % Math.ceil(donneesTransformees.length / 5) === 0
      ? formaterDateLabel(d.date)
      : ''
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.boutonNavigation} onPress={() => router.push('/Commandes')}>
        <Text style={styles.texteBouton}>Retour au contrôle des données</Text>
      </TouchableOpacity>

      <Text style={styles.titre}>Historique du Compost :</Text>

      <Picker
        selectedValue={periode}
        onValueChange={(itemValue) => setPeriode(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Jour" value="day" />
        <Picker.Item label="Semaine" value="week" />
        <Picker.Item label="Mois" value="month" />
      </Picker>

      {donnees.length > 0 ? (
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: donneesTransformees.map(d => d.temperature),
                color: () => 'rgba(255, 0, 0, 0.8)',
              },
              {
                data: donneesTransformees.map(d => d.humidite),
                color: () => 'rgba(0, 0, 255, 0.8)',
              },
            ],
            legend: ['Température (°C)', 'Humidité (%)'],
          }}
          width={screenWidth - 20}
          height={300}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: '3',
              strokeWidth: '1',
              stroke: '#000',
            },
          }}
          bezier
          style={{ marginVertical: 20, borderRadius: 16 }}
        />
      ) : (
        <Text style={styles.loading}>Chargement des données historiques...</Text>
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
  picker: {
    width: '100%',
    backgroundColor: '#ffffff',
    marginVertical: 20,
    borderRadius: 8,
  },
  loading: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  boutonNavigation: {
    backgroundColor: '#8E44AD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  texteBouton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoriqueCompost;
