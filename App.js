import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Button, Input } from 'react-native-elements';


const db = SQLite.openDatabase('expornsqlite');

db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
  console.log('Foreign keys turned on')
);

export default function App() {

  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const addCategory = () => {
    if (!category) {
      alert("Enter category");
      return false;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO categories (name) VALUES (?)`,
        [category],
        (sqlTxn, res) => {
          console.log(`${category} category added successfully`);
          getCategories();
          setCategory("");
        },
        error => {
          console.log("error on adding category " + error.message);
        },
      );
    });
  };

  const getCategories = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM categories ORDER BY id DESC`,
        [],
        (sqlTxn, res) => {
          console.log("categories retrieved successfully");
          let len = res.rows.length;

          if (len > 0) {
            let results = [];
            for (let i = 0; i < len; i++) {
              let item = res.rows.item(i);
              results.push({ id: item.id, name: item.name });
            }

            setCategories(results);
          }
        },
        error => {
          console.log("error on getting categories " + error.message);
        },
      );
    });
  };

  const renderCategory = ({ item }) => {
    return (
      <View style={{
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}>
        <Text style={{ marginRight: 9 }}>{item.id}</Text>
        <Text>{item.name}</Text>
      </View>
    );
  };

  const createTables = () => {
    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20))`,
        [],
        (sqlTxn, res) => {
          console.log("table created successfully");
        },
        error => {
          console.log("error on creating table " + error.message);
        },
      );
    });
  };

  useEffect(() => {
    createTables();
    getCategories();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={'auto'}/>
      <Input 
        placeholder="Category" 
        value={category} 
        onChangeText={setCategory}
        style={{ marginBottom: 10, marginTop:50, justifyContent: 'center' }}
      />
      <Button title="Add Category" containerStyle={styles.button} onPress={addCategory}/>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        key={cat => cat.id}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    // backgroundColor: '#00ad00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    backgroundColor: '#222',
  },
  button: {
      width: 200,
      marginTop: 10,
  }
});
