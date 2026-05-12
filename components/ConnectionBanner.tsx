import { useWebSocket } from '@/lib/websocket/useWebSocket';
import { useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConnectionBanner() {
  const { isConnected } = useWebSocket();
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  const segments = useSegments();
  const isLoginPage = segments[0] === 'sign-in';

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isConnected) {
      const delay = __DEV__ ? 4000 : 1500;

      timeout = setTimeout(() => {
        setShouldRender(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
        }).start();
      }, delay);
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }

    return () => clearTimeout(timeout);
  }, [isConnected, slideAnim]);

  if (!shouldRender || isLoginPage) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top : 10,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          Brak połączenia z serwerem. Próbuję połączyć...
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    zIndex: 9999,
    elevation: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  content: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});