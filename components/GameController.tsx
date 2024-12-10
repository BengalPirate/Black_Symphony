import React from 'react';
import { View, StyleSheet } from 'react-native';
import Joystick from './Joystick';
import ActionButtons from './ActionButtons';

interface GameControllerProps {
  onMove: (dx: number, dy: number) => void;
  onShoot: () => void;
  onMelee: () => void;
  onDash: () => void;
}

const GameController: React.FC<GameControllerProps> = ({
  onMove,
  onShoot,
  onMelee,
  onDash,
}) => {
  return (
    <View style={styles.container}>
      <Joystick onMove={onMove} />
      <ActionButtons onShoot={onShoot} onMelee={onMelee} onDash={onDash} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GameController;
