import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { apiFetch } from "@/lib/api/client";

interface Purchase {
  id: string;
  status: string;
  access_expires_at: string | null;
  bundle_id: string;
  bundles: { title: string } | null;
}

interface Pdf {
  id: string;
  bundle_id: string;
  title: string;
}

export default function MyBundlesScreen() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ purchases: Purchase[]; pdfs: Pdf[] }>("/api/purchases");
      setPurchases(data.purchases.filter((p) => p.status === "success"));
      setPdfs(data.pdfs);
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
      ListHeaderComponent={<Text style={styles.heading}>My Bundles</Text>}
      data={purchases}
      keyExtractor={(p) => p.id}
      ListEmptyComponent={
        <Text style={styles.empty}>You don&apos;t have any active bundles yet.</Text>
      }
      renderItem={({ item }) => {
        const expired = item.access_expires_at && new Date(item.access_expires_at) < new Date();
        const bundlePdfs = pdfs.filter((p) => p.bundle_id === item.bundle_id);
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.bundles?.title ?? "Bundle"}</Text>
              <View style={[styles.badge, expired ? styles.badgeDanger : styles.badgeSuccess]}>
                <Text style={[styles.badgeText, expired ? styles.badgeTextDanger : styles.badgeTextSuccess]}>
                  {expired ? "Expired" : "Active"}
                </Text>
              </View>
            </View>
            {item.access_expires_at && (
              <Text style={styles.cardSubtext}>
                Valid until {new Date(item.access_expires_at).toLocaleDateString("en-IN")}
              </Text>
            )}
            {bundlePdfs.length === 0 ? (
              <Text style={styles.cardSubtext}>No PDFs added yet.</Text>
            ) : (
              bundlePdfs.map((pdf) => (
                <View key={pdf.id} style={styles.pdfRow}>
                  <Text style={styles.pdfText} numberOfLines={1}>
                    📄 {pdf.title}
                  </Text>
                </View>
              ))
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  listContent: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 24, fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
  cardSubtext: { fontSize: 12, color: "#9ca3af", marginTop: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeSuccess: { backgroundColor: "#dcfce7" },
  badgeDanger: { backgroundColor: "#fee2e2" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  badgeTextSuccess: { color: "#166534" },
  badgeTextDanger: { color: "#991b1b" },
  pdfRow: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
  },
  pdfText: { fontSize: 13, color: "#374151" },
});
