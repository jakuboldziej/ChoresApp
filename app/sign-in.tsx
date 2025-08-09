import { LoginResponse, validatePassword } from '@/lib/auth';
import { login } from '@/lib/fetch/auth';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from './(context)/AuthContext';

export default function SignIn() {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useSession();

  const passwordInputRef = useRef<TextInput>(null);

  const handleSignIn = async (asGuest: boolean) => {
    if (asGuest === false) {
      if (!displayName || !password) {
        Alert.alert('Error', 'Wypełnij wszystkie pola');
        return;
      }

      const validatedPassword = validatePassword(password);

      if (validatedPassword.isValid === false) {
        setErrorMessage(validatedPassword.message as string);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (asGuest) {
        await signIn(asGuest);
      } else {
        const response = await login(displayName, password);
        if (!response) throw new Error("Login response is undefined");
        await signIn(false, response as LoginResponse);
      }
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Nie udało się zalogować. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!errorMessage) return;

    const intervalId = setTimeout(() => {
      setErrorMessage('');
    }, 5000);

    return () => clearTimeout(intervalId);
  }, [errorMessage]);

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-center mb-2">Zaloguj się</Text>
      </View>

      <View className="gap-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Nazwa użytkownika</Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="johndoe"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="none"
            autoComplete="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Hasło</Text>
          <TextInput
            ref={passwordInputRef}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder="*********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={() => handleSignIn(false)}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-blue-600 py-3 rounded-lg mt-6"
          onPress={() => handleSignIn(false)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">Zaloguj się</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-gray-200 py-3 rounded-lg mt-4"
          onPress={() => handleSignIn(true)}
          disabled={isLoading}
        >
          <Text className="text-gray-800 text-center font-semibold text-lg">Zaloguj się jako gość</Text>
        </TouchableOpacity>

        {errorMessage && <Text className='text-red-500'>{errorMessage}</Text>}
      </View>
    </View>
  );
}
