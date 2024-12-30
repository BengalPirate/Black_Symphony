// Layout.tsx
import React, { createContext, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

// Create a context to store whether we should play the background video
export const BgVideoContext = createContext({
  playBackground: false,
  setPlayBackground: (_val: boolean) => {},
});

export default function Layout() {
  const [playBackground, setPlayBackground] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <BgVideoContext.Provider value={{ playBackground, setPlayBackground }}>
      {/* Hide the status bar on both Android and iOS */}
      <StatusBar hidden />

      <View style={{ flex: 1 }}>
        {/* If the global state says "play background video," render it behind everything */}
        {playBackground && (
          <Video
            source={require('../assets/videos/TitleScreen1.mp4')}
            style={StyleSheet.absoluteFill} // Fill entire screen
            resizeMode={'cover' as ResizeMode}             // or 'contain' / 'stretch' as you prefer
            shouldPlay
            isLooping
          />
        )}

        {/* Render the current route (StartScreen, MenuScreen, etc.) */}
        <Slot />
      </View>
    </BgVideoContext.Provider>
  );
}
