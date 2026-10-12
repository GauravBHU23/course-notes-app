import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "@/lib/api/client";
import type { ExamCategory, BundlePublic } from "@/types/domain";

export default function BrowseScreen() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [bundles, setBundles] = useState<BundlePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [catData, bundleData] = await Promise.all([
        apiFetch<{ categories: ExamCategory[] }>("/api/public/categories"),
        apiFetch<{ bundles: BundlePublic[] }>("/api/public/bundles"),
      ]);
      setCategories(catData.categories);
      setBundles(bundleData.bundles);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Browse Courses &amp; Notes</Text>

          {categories.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Exam Categories</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(c) => c.id}
                contentContainerStyle={styles.chipRow}
                renderItem={({ item }) => (
                  <Pressable style={styles.chip}>
                    <Text style={styles.chipText}>{item.name}</Text>
                  </Pressable>
                )}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>All Bundles</Text>
        </View>
      }
      data={bundles}
      keyExtractor={(b) => b.id}
      ListEmptyComponent={
        <Text style={styles.empty}>Bundles will appear here once they&apos;re published.</Text>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/bundle/${item.slug}`)}>
          <Text style={styles.cardCategory}>{item.category_name}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>₹{item.price_inr}</Text>
            <Text style={styles.cardValidity}>/ {item.validity_days} days</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  listContent: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 10, marginTop: 8 },
  chipRow: { gap: 8, paddingBottom: 16 },
  chip: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { color: "#4338ca", fontSize: 13, fontWeight: "500" },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 24, fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardCategory: { fontSize: 11, fontWeight: "600", color: "#4f46e5", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardDescription: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  cardFooter: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 10 },
  cardPrice: { fontSize: 18, fontWeight: "700", color: "#111827" },
  cardValidity: { fontSize: 12, color: "#9ca3af" },
});
