import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  onShoot: () => void;
  onMelee: () => void;
  onDash: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onShoot,
  onMelee,
  onDash,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onShoot} style={styles.button}>
        <Text style={styles.text}>Shoot</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onMelee} style={styles.button}>
        <Text style={styles.text}>Melee</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDash} style={styles.button}>
        <Text style={styles.text}>Dash</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 50,
    justifyContent: 'space-between',
  },
  button: {
    width: 60,
    height: 60,
    marginVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  text: {
    color: 'white',
    fontSize: 14,
  },
});

export default ActionButtons;
