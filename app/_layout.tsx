import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function Layout() {
  // Lock the orientation to landscape
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    // Render the current route
    <Slot />
  );
}
