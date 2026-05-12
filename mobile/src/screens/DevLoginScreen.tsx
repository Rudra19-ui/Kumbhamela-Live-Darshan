import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../api/client";
import { API_BASE } from "../config";
import { tr } from "../i18n/strings";
import { useAuthStore } from "../store/authStore";
import { useLangStore } from "../store/langStore";
import { elevations as E, theme as T } from "../theme/colors";

export function DevLoginScreen() {
  const lang = useLangStore((s) => s.lang);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [phone, setPhone] = useState("8888888888");
  const [name, setName] = useState("Bhakt");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{
        access: string;
        refresh: string;
        user: { id: string; phone: string; full_name: string; email?: string; role: string };
      }>("/api/v1/auth/dev-login/", {
        method: "POST",
        body: JSON.stringify({ phone, full_name: name }),
        timeoutMs: 18_000,
      });
      setAuth(res.access, res.refresh, res.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>KumbhConnect</Text>
      <Text style={styles.sub}>{tr(lang, "devLoginTitle")}</Text>
      <Text style={styles.apiHint} selectable>
        API: {API_BASE}
      </Text>
      <Text style={styles.label}>{tr(lang, "phone")}</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholder="10-digit number"
      />
      <Text style={styles.label}>{tr(lang, "name")}</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Pressable style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={T.primaryBtnText} />
        ) : (
          <Text style={styles.btnText}>{tr(lang, "continue")}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, paddingTop: 64, backgroundColor: T.bgPage },
  title: { fontSize: 28, fontWeight: "800", color: T.accent },
  sub: { marginTop: 8, color: T.textSecondary, marginBottom: 8 },
  apiHint: {
    fontSize: 11,
    lineHeight: 16,
    color: T.textMuted,
    marginBottom: 16,
  },
  label: { fontWeight: "600", marginBottom: 6, color: T.text },
  input: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: T.surface,
    color: T.text,
  },
  btn: {
    backgroundColor: T.primaryBtn,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    ...E.heroBtn,
  },
  btnText: { color: T.primaryBtnText, fontWeight: "700", fontSize: 16 },
  err: { color: T.danger, marginBottom: 8, fontSize: 13, lineHeight: 20 },
});
