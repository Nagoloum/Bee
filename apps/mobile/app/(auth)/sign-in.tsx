import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      router.replace('/(client)');
    } catch (e) {
      Alert.alert('Erreur', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-8">
        <Text className="text-3xl font-bold text-amber-700">Connexion</Text>
        <TextInput
          className="mt-8 rounded-lg border border-slate-300 p-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="mt-4 rounded-lg border border-slate-300 p-4"
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable
          className="mt-6 rounded-xl bg-amber-600 px-6 py-4"
          disabled={loading}
          onPress={handleSubmit}
        >
          <Text className="text-center font-semibold text-white">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
