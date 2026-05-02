import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-2xl font-bold text-amber-700">Créer un compte</Text>
        <Text className="mt-4 text-center text-slate-600">
          Formulaire d'inscription à implémenter.
        </Text>
      </View>
    </SafeAreaView>
  );
}
