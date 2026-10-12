import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiFetch } from "@/lib/api/client";
import type { BundlePublic, PdfSummary } from "@/types/domain";

export default function BundleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [bundle, setBundle] = useState<BundlePublic | null>(null);
  const [pdfs, setPdfs] = useState<PdfSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ bundle: BundlePublic; pdfs: PdfSummary[] }>(
          `/api/public/bundles/${slug}`
        );
        setBundle(data.bundle);
        setPdfs(data.pdfs);
      } catch {
        setError("This bundle could not be found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  if (error || !bundle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Bundle not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.category}>{bundle.category_name}</Text>
      <Text style={styles.title}>{bundle.title}</Text>
      {bundle.description && <Text style={styles.description}>{bundle.description}</Text>}

      <View style={styles.priceCard}>
        <Text style={styles.price}>₹{bundle.price_inr}</Text>
        <Text style={styles.validity}>Access for {bundle.validity_days} days</Text>
      </View>

      <Text style={styles.sectionTitle}>What&apos;s included</Text>
      {pdfs.length === 0 ? (
        <Text style={styles.emptyPdfs}>PDF list will appear here once published.</Text>
      ) : (
        pdfs.map((pdf) => (
          <View key={pdf.id} style={styles.pdfRow}>
            <Text style={styles.pdfTitle}>{pdf.title}</Text>
            {pdf.page_count && <Text style={styles.pdfPages}>{pdf.page_count} pages</Text>}
          </View>
        ))
      )}

      <Pressable
        style={styles.buyButton}
        onPress={() =>
          Alert.alert(
            "Checkout coming soon",
            "In-app purchase isn't wired up yet in this build. Buy this bundle from the website for now."
          )
        }
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 40 },
  errorText: { color: "#6b7280", fontSize: 14 },
  category: { fontSize: 12, fontWeight: "600", color: "#4f46e5", marginBottom: 6 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  description: { fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 20 },
  priceCard: {
    marginTop: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
  },
  price: { fontSize: 28, fontWeight: "700", color: "#111827" },
  validity: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginTop: 24, marginBottom: 10 },
  emptyPdfs: { fontSize: 13, color: "#9ca3af" },
  pdfRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 8,
  },
  pdfTitle: { fontSize: 14, color: "#111827", flex: 1, marginRight: 8 },
  pdfPages: { fontSize: 12, color: "#9ca3af" },
  buyButton: {
    marginTop: 24,
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buyButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
