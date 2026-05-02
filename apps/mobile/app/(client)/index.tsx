import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientHome() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <Text className="text-3xl font-bold text-amber-700">🐝 Bee</Text>
        <Text className="mt-2 text-slate-600">Bienvenue sur votre marketplace.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
