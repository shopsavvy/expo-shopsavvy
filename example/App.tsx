import React, { useState } from "react"
import { FlatList, SafeAreaView, Text, TextInput, View } from "react-native"
import Constants from "expo-constants"
import { ShopsavvyProvider, useProductSearch } from "expo-shopsavvy"

// Injected by the expo-shopsavvy config plugin from app.json -> plugins -> apiKey.
const API_KEY = (Constants.expoConfig?.extra as { shopsavvyApiKey?: string } | undefined)?.shopsavvyApiKey ?? ""

function SearchScreen() {
  const [query, setQuery] = useState("AirPods Pro")
  const { data, loading, error } = useProductSearch(query)
  return (
    <View style={{ padding: 16 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 }}
      />
      {loading && <Text>Loading…</Text>}
      {error && <Text>Error: {error.message}</Text>}
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.shopsavvy}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </View>
  )
}

export default function App() {
  return (
    <ShopsavvyProvider apiKey={API_KEY}>
      <SafeAreaView>
        <SearchScreen />
      </SafeAreaView>
    </ShopsavvyProvider>
  )
}
