import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectMage } from '@/store/mageSlice';
import { useRouter } from 'expo-router';

import fireMage1 from '@/assets/sprites/player_sprites/fire_mage/fire_mage1.png';
import fireMage2 from '@/assets/sprites/player_sprites/fire_mage/fire_mage2.png';
import earthMage1 from '@/assets/sprites/player_sprites/earth_mage/earth_mage1.png';
import earthMage2 from '@/assets/sprites/player_sprites/earth_mage/earth_mage2.png';
import iceMage1 from '@/assets/sprites/player_sprites/ice_mage/ice_mage1.png';
import iceMage2 from '@/assets/sprites/player_sprites/ice_mage/ice_mage2.png';
import lightMage1 from '@/assets/sprites/player_sprites/light_mage/light_mage1.png';
import lightMage2 from '@/assets/sprites/player_sprites/light_mage/light_mage2.png';
import windMage1 from '@/assets/sprites/player_sprites/wind_mage/wind_mage1.png';
import windMage2 from '@/assets/sprites/player_sprites/wind_mage/wind_mage2.png';
import timeMage1 from '@/assets/sprites/player_sprites/time_mage/time_mage1.png';
import timeMage2 from '@/assets/sprites/player_sprites/time_mage/time_mage2.png';
import lightningMage1 from '@/assets/sprites/player_sprites/lightning_mage/lightning_mage1.png';
import lightningMage2 from '@/assets/sprites/player_sprites/lightning_mage/lightning_mage2.png';
import darkMage1 from '@/assets/sprites/player_sprites/dark_mage/dark_mage1.png';
import darkMage2 from '@/assets/sprites/player_sprites/dark_mage/dark_mage2.png';

import MagePreview from '@/assets/sprites/player_sprites/MagePreview';

const mages = [
  { key: 'fire',   mage1: fireMage1,   mage2: fireMage2 },
  { key: 'earth',  mage1: earthMage1,  mage2: earthMage2 },
  { key: 'ice',    mage1: iceMage1,    mage2: iceMage2 },
  { key: 'light',  mage1: lightMage1,  mage2: lightMage2 },
  { key: 'wind',   mage1: windMage1,   mage2: windMage2 },
  { key: 'time',   mage1: timeMage1,   mage2: timeMage2 },
  { key: 'lightning', mage1: lightningMage1, mage2: lightningMage2 },
  { key: 'dark',   mage1: darkMage1,   mage2: darkMage2 },
];

export default function CharacterSelectionScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSelect = (mageKey: string) => {
    dispatch(selectMage(mageKey));
    // Then push to /arcade
    router.push('/arcade');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Character</Text>

      <FlatList
        data={mages}
        // 4 columns → it’ll automatically create 2 rows (8 items total)
        numColumns={4}
        // Adjust spacing for your preference
        columnWrapperStyle={styles.columnWrapper}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.mageItem}
            onPress={() => handleSelect(item.key)}
          >
            <MagePreview mage1={item.mage1} mage2={item.mage2} />
            <Text style={styles.mageLabel}>{item.key.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#111',
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  // This style makes each row center or space the items
  columnWrapper: {
    justifyContent: 'space-around', 
    marginVertical: 10,
  },
  mageItem: {
    alignItems: 'center',
    marginVertical: 6,
    width: 80,   // tweak to your preference
  },
  mageLabel: {
    marginTop: 4,
    color: '#fff',
    fontSize: 14,
  },
});
