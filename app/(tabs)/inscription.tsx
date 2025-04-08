// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// import { useRouter } from 'expo-router';

// const PageInscription: React.FC = () => {
//   const router = useRouter(); // Utilisation pour gérer la navigation
//   const [nomUtilisateur, setNomUtilisateur] = useState<string>('');
//   const [motDePasse, setMotDePasse] = useState<string>('');
//   const [email, setEmail] = useState<string>('');

//   const handleInscription = () => {
//     console.log('Nom d\'utilisateur:', nomUtilisateur);
//     console.log('Mot de passe:', motDePasse);
//     alert('Inscription réussie !');
//     router.push('/accueil'); // Redirige vers l'écran principal après l'inscription
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.titre}>Création de compte</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Nom d'utilisateur"
//         value={nomUtilisateur}
//         onChangeText={setNomUtilisateur}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Mot de passe"
//         secureTextEntry
//         value={motDePasse}
//         onChangeText={setMotDePasse}
//       />

//       <Button title="S'inscrire" onPress={handleInscription} />
  
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   titre: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingLeft: 8,
//     borderRadius: 5,
//     width: '100%',
//   },
// });

// export default PageInscription;






