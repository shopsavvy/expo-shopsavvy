import React, { useState } from "react"
import { FlatList, SafeAreaView, Text, TextInput, View } from "react-native"
import { ShopsavvyProvider, useProductSearch } from "expo-shopsavvy"
import Constants from "expo-constants"

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
        keyExtractor={(item, i) => String((item as { id?: string }).id ?? i)}
        renderItem={({ item }) => <Text>{(item as { name?: string }).name}</Text>}
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
