import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "@/lib/auth/AuthContext";

export default function ProfileScreen() {
  const { profile, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your profile</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Full name</Text>
          <Text style={styles.value}>{profile?.full_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile number</Text>
          <Text style={styles.value}>{profile?.mobile ?? "Not set"}</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    gap: 14,
  },
  row: { gap: 2 },
  label: { fontSize: 12, color: "#9ca3af" },
  value: { fontSize: 15, color: "#111827", fontWeight: "500" },
  logoutButton: {
    marginTop: 24,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: "#dc2626", fontWeight: "600", fontSize: 15 },
});
