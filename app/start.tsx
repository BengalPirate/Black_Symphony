// StartScreen.tsx
import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ExpoAv from 'expo-av';           // <-- NEW: Import expo-av
import { BgVideoContext } from '../app/_layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StartScreen() {
  const router = useRouter();
  const { setPlayBackground } = useContext(BgVideoContext);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showPressStart, setShowPressStart] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // ——————————————
  //  Sound ref
  // ——————————————
  const logoSoundRef = useRef<ExpoAv.Audio.Sound | null>(null);

  // Flicker animation for "Press Start"
  useEffect(() => {
    if (showPressStart) {
      const flicker = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      flicker.start();
      return () => flicker.stop();
    }
  }, [showPressStart, fadeAnim]);

  // ——————————————————————————————————
  // Whenever the final logo video is NOT ended yet, play finallogo_sound.mp3
  // As soon as it ends, unload the sound.
  // ——————————————————————————————————
  useEffect(() => {
    async function playFinallogoSound() {
      // If the video is still playing, load & play the short MP3
      if (!videoEnded) {
        // 1) Wait 2 seconds before playing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // If there's already a sound loaded, unload it
        if (logoSoundRef.current) {
          await logoSoundRef.current.unloadAsync();
          logoSoundRef.current = null;
        }
        // Create a Sound object
        const soundObj = new ExpoAv.Audio.Sound();
        // Load the short MP3
        await soundObj.loadAsync(require('../assets/music/finallogo_sound.mp3'));
        // Play
        await soundObj.playAsync();
        // Store ref so we can stop/unload if needed
        logoSoundRef.current = soundObj;
      } else {
        // Video ended => no need for the sound
        if (logoSoundRef.current) {
          await logoSoundRef.current.unloadAsync();
          logoSoundRef.current = null;
        }
      }
    }

    playFinallogoSound();

    // Cleanup when unmounting this screen
    return () => {
      if (logoSoundRef.current) {
        logoSoundRef.current.unloadAsync();
        logoSoundRef.current = null;
      }
    };
  }, [videoEnded]);

  // ——————————————————————————————————
  // Called on each playback status update of finallogo.mp4
  // ——————————————————————————————————
  const handleVideoStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      setVideoEnded(true);
      setShowPressStart(true);
      // Start playing the random background video + music in _layout.tsx
      setPlayBackground(true);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: videoEnded ? 'transparent' : '#000' },
      ]}
    >
      {/* Show the final logo video until it ends */}
      {!videoEnded && (
        <Video
          source={require('../assets/videos/finallogo.mp4')}
          shouldPlay
          isLooping={false}
          resizeMode={ResizeMode.CONTAIN}
          style={styles.video}
          onPlaybackStatusUpdate={handleVideoStatus}
        />
      )}

      {/* After video ends, show the "Press Start" screen */}
      {showPressStart && (
        <>
          <Image
            source={require('../assets/images/blacksymphonylogo.png')}
            style={styles.logo}
          />
          <TouchableOpacity
            style={styles.touchArea}
            onPress={() => router.push('/menu')}
          >
            <Animated.Text style={[styles.pressStartText, { opacity: fadeAnim }]}>
              Press Start
            </Animated.Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ———————————————————————————————————————————————————
// Styles
// ———————————————————————————————————————————————————
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    width: 500,
    height: 160,
    resizeMode: 'contain',
  },
  touchArea: {
    padding: 20,
  },
  pressStartText: {
    color: '#fff',
    fontSize: 32,
    bottom: -130,
  },
});
