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
import { BgVideoContext } from '../app/_layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StartScreen() {
  const router = useRouter();
  const { setPlayBackground } = useContext(BgVideoContext);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showPressStart, setShowPressStart] = useState(false);

  // Whether finallogo.mp4 has completely ended
  const [videoEnded, setVideoEnded] = useState(false);

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

  const handleVideoStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      // finallogo.mp4 is done
      setVideoEnded(true);
      setShowPressStart(true);
      // Start playing TitleScreen1.mp4 in _layout.tsx
      setPlayBackground(true);
    }
  };

  return (
    <View
      style={[
        styles.container,
        // Only black while finallogo.mp4 is playing
        { backgroundColor: videoEnded ? 'transparent' : '#000' },
      ]}
    >
      {/* Show the final logo until it ends */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // (backgroundColor is conditionally overridden above)
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
