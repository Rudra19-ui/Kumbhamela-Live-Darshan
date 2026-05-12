import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { tr } from "../i18n/strings";
import { useAuthStore } from "../store/authStore";
import type { Lang } from "../store/langStore";
import { useLangStore } from "../store/langStore";
import { elevations as E, theme as T } from "../theme/colors";

const OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

type Props = {
  /** `header` = light on maroon hero. `profile` = warm text on dark card. */
  variant?: "header" | "default" | "profile";
};

export function LanguageButton({ variant = "default" }: Props) {
  const insets = useSafeAreaInsets();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const isHeader = variant === "header";
  const isProfile = variant === "profile";
  const current = OPTIONS.find((o) => o.code === lang)?.native ?? "A/क";

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.btn, isHeader && styles.btnHeader, isProfile && styles.btnProfile]}
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Text style={[styles.btnText, isHeader && styles.btnTextHeader, isProfile && styles.btnTextProfile]}>
          {current}
        </Text>
        <Text style={[styles.chev, isHeader && styles.chevHeader, isProfile && styles.chevProfile]}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.sheetWrap, { top: insets.top + 8 }]}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>भाषा · Language · भाषा</Text>
              {OPTIONS.map((o) => (
                <Pressable
                  key={o.code}
                  style={[styles.option, lang === o.code && styles.optionActive]}
                  onPress={() => {
                    setLang(o.code);
                    setOpen(false);
                    const tok = useAuthStore.getState().accessToken;
                    if (tok) {
                      void api("/api/v1/auth/me/", {
                        method: "PATCH",
                        body: JSON.stringify({ preferred_language: o.code }),
                      }).catch(() => {});
                    }
                  }}
                >
                  <Text style={styles.optionNative}>{o.native}</Text>
                  <Text style={styles.optionEn}>{o.label}</Text>
                  {lang === o.code ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              ))}
              <Pressable style={styles.close} onPress={() => setOpen(false)}>
                <Text style={styles.closeTx}>{tr(lang, "close")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: T.accent,
    backgroundColor: T.surface,
    gap: 4,
  },
  btnHeader: {
    borderColor: T.heroText,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  btnProfile: {
    borderColor: T.borderStrong,
    backgroundColor: T.surface,
  },
  btnText: { fontWeight: "700", fontSize: 14, color: T.accent },
  btnTextHeader: { color: T.heroText },
  btnTextProfile: { color: T.heading },
  chev: { fontSize: 10, color: T.accent, marginTop: 2 },
  chevHeader: { color: T.heroText },
  chevProfile: { color: T.heading },
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: T.modalBackdrop },
  sheetWrap: {
    position: "absolute",
    right: 12,
    maxWidth: 280,
    alignSelf: "flex-end",
  },
  sheet: {
    backgroundColor: T.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.card,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: T.accent,
    marginBottom: 10,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: T.surfaceMuted,
  },
  optionActive: { backgroundColor: T.optionActiveBg, borderWidth: 1, borderColor: T.accent },
  optionNative: { fontSize: 17, fontWeight: "700", color: T.text, flex: 1 },
  optionEn: { fontSize: 12, color: T.textMuted, marginRight: 8 },
  check: { color: T.success, fontWeight: "800", fontSize: 16 },
  close: { marginTop: 8, padding: 10, alignItems: "center" },
  closeTx: { color: T.accent, fontWeight: "600" },
});
