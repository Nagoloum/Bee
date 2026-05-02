import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Landing() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-6xl">🐝</Text>
        <Text className="mt-4 text-4xl font-bold text-amber-700">Bee</Text>
        <Text className="mt-2 text-center text-lg text-slate-600">
          La marketplace des vendeurs locaux
        </Text>

        <View className="mt-12 w-full gap-3">
          <Pressable
            className="rounded-xl bg-amber-600 px-6 py-4"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text className="text-center font-semibold text-white">Se connecter</Text>
          </Pressable>
          <Pressable
            className="rounded-xl border-2 border-amber-600 px-6 py-4"
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text className="text-center font-semibold text-amber-700">Créer un compte</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
