// app/_layout.tsx (Adjust if needed based on your project structure)
// --------------------------------------------------------------------------------
// A Layout component that:
//   1) Locks orientation to LANDSCAPE
//   2) Plays random .mp3 tracks from /assets/music/*
//   3) Loops tracks indefinitely, picking a new random track after each finishes
//   4) Displays "TitleScreen1.mp4" behind child screens if "playBackground" is true
//   5) Lets you fade out music with "fadeOutMusicAndStop" (e.g. on menu selection)
//   6) Uses a "manual loadAsync" approach (no .createAsync)
//   7) Handles repeated fade-out calls gracefully by copying the sound ref
//
// Note: We remove references to InterruptionModeIOS/Android (undefined in expo-av@15.x).
// --------------------------------------------------------------------------------

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ExpoAv from 'expo-av';

// -----------------------------------------------------------------------------
// 1) Create a context for controlling background video + music
// -----------------------------------------------------------------------------
export const BgVideoContext = createContext({
  playBackground: false,
  setPlayBackground: (_val: boolean) => {},
  fadeOutMusicAndStop: () => {},
});

// -----------------------------------------------------------------------------
// 2) Main Layout Component
// -----------------------------------------------------------------------------
export default function Layout() {
  // Whether to show the background video (and play music)
  const [playBackground, setPlayBackground] = useState(false);

  // Whether music is currently active
  const [musicActive, setMusicActive] = useState(false);

  // Store the current Sound object in a ref
  const soundRef = useRef<ExpoAv.Audio.Sound | null>(null);

  // List of possible music tracks
  const trackList = [
    require('../assets/music/track1.mp3'),
    require('../assets/music/track2.mp3'),
    require('../assets/music/track3.mp3'),
    require('../assets/music/track4.mp3'),
    require('../assets/music/track5.mp3'),
    require('../assets/music/track6.mp3'),
    require('../assets/music/track7.mp3'),
  ];

  // Lock orientation to LANDSCAPE once
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  // -----------------------------------------------------------------------------
  // Helper: pick a random track from trackList
  // -----------------------------------------------------------------------------
  const getRandomTrack = useCallback(() => {
    const index = Math.floor(Math.random() * trackList.length);
    return trackList[index];
  }, [trackList]);

  // -----------------------------------------------------------------------------
  // (A) "playNextRandomTrack": load/play track manually; loop when finished
  // -----------------------------------------------------------------------------
  const playNextRandomTrack = useCallback(async () => {
    try {
      // If there's already a sound loaded, unload it
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // 1) Create a new Sound object
      const soundObj = new ExpoAv.Audio.Sound();

      // 2) Load a random track
      await soundObj.loadAsync(getRandomTrack());

      // 3) Ensure volume is full (1.0)
      await soundObj.setVolumeAsync(1);

      // 4) Start playback
      await soundObj.playAsync();

      // 5) Keep a ref so we can fade/stop later
      soundRef.current = soundObj;

      // 6) When track finishes, pick another
      soundObj.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await playNextRandomTrack();
        }
      });
    } catch (error) {
      console.warn('Error in playNextRandomTrack:', error);
    }
  }, [getRandomTrack]);

  // -----------------------------------------------------------------------------
  // (B) "startMusic": set audio mode & start the random track loop
  // -----------------------------------------------------------------------------
  const startMusic = useCallback(async () => {
    if (!musicActive) {
      setMusicActive(true);

      try {
        // We'll just set the minimal properties that exist in expo-av@15.x
        await ExpoAv.Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.log('Error calling setAudioModeAsync:', err);
      }

      // Begin looping tracks
      await playNextRandomTrack();
    }
  }, [musicActive, playNextRandomTrack]);

  // -----------------------------------------------------------------------------
  // (C) "fadeOutMusicAndStop": fade volume, then stop/unload
  // -----------------------------------------------------------------------------
  const fadeOutMusicAndStop = useCallback(async () => {
    // Hide the background video
    setPlayBackground(false);

    // Copy the current sound (if any) and reset ref immediately
    const currentSound = soundRef.current;
    soundRef.current = null;

    if (!currentSound) {
      // No sound loaded => no fade out
      setMusicActive(false);
      return;
    }

    try {
      // Gradually reduce volume from 1 -> 0
      for (let volume = 1; volume >= 0; volume -= 0.1) {
        await currentSound.setVolumeAsync(volume);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (fadeErr) {
      console.log('Fade out error:', fadeErr);
    }

    // Stop & unload
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (stopErr) {
      console.log('Stop/unload error:', stopErr);
    }

    setMusicActive(false);
  }, []);

  // -----------------------------------------------------------------------------
  // (D) Watch "playBackground". If true, start the music/video
  // -----------------------------------------------------------------------------
  useEffect(() => {
    if (playBackground) {
      startMusic();
    }
    // if false, we rely on fadeOutMusicAndStop() to handle stopping
  }, [playBackground, startMusic]);

  // -----------------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------------
  return (
    <BgVideoContext.Provider
      value={{
        playBackground,
        setPlayBackground,
        fadeOutMusicAndStop,
      }}
    >
      <StatusBar hidden />

      <View style={{ flex: 1 }}>
        {/* If "playBackground" is true, show TitleScreen1.mp4 behind everything */}
        {playBackground && (
          <Video
            source={require('../assets/videos/TitleScreen1.mp4')}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
          />
        )}

        {/* Render child routes (StartScreen, MenuScreen, etc.) */}
        <Slot />
      </View>
    </BgVideoContext.Provider>
  );
}
