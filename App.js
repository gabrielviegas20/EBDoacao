import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import styles from './components/styles.css'

const db = SQLite.openDatabase('bloodDonation.db');

const App = () => {
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS donors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, bloodType TEXT)'
      );
    });
  }, []);

  const handleSave = () => {
    if (name.trim() === '' || bloodType.trim() === '') {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO donors (name, bloodType) VALUES (?, ?)',
        [name, bloodType],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Sucesso', 'Doação registrada com sucesso');
            setName('');
            setBloodType('');
            fetchDonors();
          } else {
            Alert.alert('Erro', 'Erro ao registrar a doação');
          }
        }
      );
    });
  };

  const fetchDonors = () => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM donors', [], (_, { rows }) => {
        setDonors(rows._array);
      });
    });
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const getMatchingDonors = (selectedBloodType) => {
    return donors.filter((donor) => donor.bloodType === selectedBloodType && donor.name !== name);
  };

  const getEligibleRecipients = (selectedBloodType) => {
    return donors.filter((donor) => donor.bloodType !== selectedBloodType && donor.name !== name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nome:</Text>
      <TextInput
        value={name}
        onChangeText={(text) => setName(text)}
        placeholder="Digite o nome"
        style={styles.input}
      />
      <Text style={styles.title}>Tipo Sanguíneo:</Text>
      <TextInput
        value={bloodType}
        onChangeText={(text) => setBloodType(text)}
        placeholder="Digite o tipo sanguíneo"
        style={styles.input}
      />
      <Button title="Salvar" onPress={handleSave} />

      <Text style={styles.title}>Tabela de Doação:</Text>
      <Text style={styles.subtitle}>Doadores compatíveis:</Text>
      <FlatList
        data={getMatchingDonors(bloodType)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.donorText}>Nome: {item.name}, Tipo Sanguíneo: {item.bloodType}</Text>
        )}
      />

      <Text style={styles.subtitle}>Receptores elegíveis:</Text>
      <FlatList
        data={getEligibleRecipients(bloodType)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.donorText}>Nome: {item.name}, Tipo Sanguíneo: {item.bloodType}</Text>
        )}
      />

      <Button title="Consultar Tabela de Doação" onPress={fetchDonors} />
    </View>
  );
};



export default App;
