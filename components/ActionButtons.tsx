import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

interface ActionButtonsProps {
  onDash: () => void;
  onShoot: () => void;
  onSpecial: () => void;
  onUseItem: () => void;
  onMelee: () => void;
}

const { width, height } = Dimensions.get('window');

const BUTTON_SIZE = 60;
const BUTTON_MARGIN = 20;

const ActionButtons: React.FC<ActionButtonsProps> = ({ onDash, onShoot, onSpecial, onUseItem, onMelee, }) => {
  return (
    <View style={styles.container}>
      {/* Dash (Bottom) */}
      <TouchableOpacity onPress={onDash} style={[styles.button, styles.bottomButton]}>
        <Text style={styles.buttonText}>Dash</Text>
      </TouchableOpacity>

      {/* Shoot (Right) */}
      <TouchableOpacity onPress={onShoot} style={[styles.button, styles.rightButton]}>
        <Text style={styles.buttonText}>Shoot</Text>
      </TouchableOpacity>

      {/* Special (Top) */}
      <TouchableOpacity onPress={onSpecial} style={[styles.button, styles.topButton]}>
        <Text style={styles.buttonText}>Special</Text>
      </TouchableOpacity>

      {/* Use Item (Left) */}
      <TouchableOpacity onPress={onUseItem} style={[styles.button, styles.leftButton]}>
        <Text style={styles.buttonText}>Use</Text>
      </TouchableOpacity>

      {/* Melee (Below Dash) */}
      <TouchableOpacity onPress={onMelee} style={[styles.button, styles.meleeButton]}>
        <Text style={styles.buttonText}>Melee</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: BUTTON_SIZE * 3, // Expand to fit the diamond layout
    height: BUTTON_SIZE * 3,
  },
  button: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButton: {
    top: BUTTON_SIZE + BUTTON_MARGIN, // Place at the bottom of the diamond
    left: BUTTON_SIZE + BUTTON_MARGIN / 2,
  },
  rightButton: {
    top: BUTTON_SIZE / 2, // Place at the right of the diamond
    left: BUTTON_SIZE * 2 + BUTTON_MARGIN,
  },
  topButton: {
    top: 0, // Place at the top of the diamond
    left: BUTTON_SIZE + BUTTON_MARGIN / 2,
  },
  leftButton: {
    top: BUTTON_SIZE / 2, // Place at the left of the diamond
    left: 0,
  },
  meleeButton: {
    top: BUTTON_SIZE * 2 + BUTTON_MARGIN, 
    left: BUTTON_SIZE + BUTTON_MARGIN / 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ActionButtons;
