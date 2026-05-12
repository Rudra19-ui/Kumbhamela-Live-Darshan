import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../api/client";
import { paged } from "../../api/paged";
import {
  buildDemoSlots,
  FALLBACK_CATEGORIES,
  FALLBACK_PUNDITS,
  getFallbackOfferingById,
  isDemoOfferingId,
  isDemoSlotId,
  listFallbackOfferingsForCategory,
} from "../../data/homeFallback";
import { preferDevanagari } from "../../i18n/localeDisplay";
import { tr } from "../../i18n/strings";
import type { PoojaStackParamList } from "../../navigation/types";
import { useLangStore } from "../../store/langStore";
import { elevations as E, theme as T } from "../../theme/colors";

type Cat = { id: string; name: string; name_hindi: string };
type Off = {
  id: string;
  name: string;
  name_hindi: string;
  base_price: string;
  duration_minutes: number;
  mode: string;
};
type Pundit = { id: string; user: { full_name: string }; rating: string };
type Slot = { id: string; date: string; start_time: string; end_time: string; mode: string };

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function CategoriesScreen({ navigation }: NativeStackScreenProps<PoojaStackParamList, "Categories">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const q = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Cat[]>("/api/v1/poojas/categories/"),
    retry: 1,
  });
  const { cats, usingDemo } = useMemo(() => {
    const raw = q.data;
    const ok = raw && raw.length > 0;
    return { cats: ok ? raw : FALLBACK_CATEGORIES, usingDemo: !ok || q.isError };
  }, [q.data, q.isError]);

  if (q.isPending && !q.data) return <Centered />;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 28 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={T.accent} />
      }
    >
      <Text style={styles.head}>{tr(lang, "categories")}</Text>
      {usingDemo ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{tr(lang, "poojaDemoBanner")}</Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {cats.map((c) => (
          <Pressable
            key={c.id}
            style={styles.tile}
            onPress={() =>
              navigation.navigate("Offerings", {
                categoryId: c.id,
                categoryName: preferDevanagari(lang) ? c.name_hindi || c.name : c.name,
              })
            }
          >
            <View style={styles.tileOmWrap}>
              <Text style={styles.tileOm}>ॐ</Text>
            </View>
            <Text style={styles.tileHi}>
              {preferDevanagari(lang) ? c.name_hindi || c.name : c.name}
            </Text>
            <Text style={styles.tileEn}>{c.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export function OfferingsScreen({
  route,
  navigation,
}: NativeStackScreenProps<PoojaStackParamList, "Offerings">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const { categoryId } = route.params;
  const q = useQuery({
    queryKey: ["offerings", categoryId],
    queryFn: () => paged<Off>(`/api/v1/poojas/offerings/?category=${categoryId}`),
    retry: 1,
  });

  const offerings = useMemo(() => {
    const raw = q.data ?? [];
    if (raw.length > 0) return raw;
    if (categoryId.startsWith("fb-")) return listFallbackOfferingsForCategory(categoryId) as Off[];
    return [];
  }, [q.data, categoryId]);

  if (q.isPending && !q.data) return <Centered />;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 28 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={T.accent} />
      }
    >
      {offerings.length === 0 ? (
        <Text style={styles.empty}>{tr(lang, "noOfferings")}</Text>
      ) : (
        offerings.map((o) => (
          <Pressable
            key={o.id}
            style={styles.row}
            onPress={() => navigation.navigate("OfferingDetail", { offeringId: o.id })}
          >
            <Text style={styles.rowHi}>
              {preferDevanagari(lang) ? o.name_hindi || o.name : o.name}
            </Text>
            <Text style={styles.rowMeta}>
              ₹{o.base_price} · {o.duration_minutes} min · {o.mode}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export function OfferingDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<PoojaStackParamList, "OfferingDetail">) {
  const lang = useLangStore((s) => s.lang);
  const { offeringId } = route.params;
  const demo = getFallbackOfferingById(offeringId);
  const q = useQuery({
    queryKey: ["offering", offeringId],
    queryFn: () => api<Off>(`/api/v1/poojas/offerings/${offeringId}/`),
    enabled: !demo,
    retry: 1,
  });
  const o = (demo ?? q.data) as Off | undefined;
  if (!demo && (q.isPending || !q.data)) return <Centered />;
  if (!o) return <Centered />;
  const pick = (mode: "online" | "offline") => {
    if (o.mode !== "both" && o.mode !== mode) {
      Alert.alert("Mode", `This seva is ${o.mode} only.`);
      return;
    }
    navigation.navigate("PunditPick", { offeringId, mode });
  };
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.head}>
        {preferDevanagari(lang) ? o.name_hindi || o.name : o.name}
      </Text>
      <Text style={styles.body}>₹{o.base_price}</Text>
      <Text style={styles.label}>{tr(lang, "mode")}</Text>
      <View style={styles.rowBtns}>
        <Pressable style={styles.btn} onPress={() => pick("online")}>
          <Text style={styles.btnTx}>{tr(lang, "online")}</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => pick("offline")}>
          <Text style={styles.btnTx}>{tr(lang, "offline")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function PunditPickScreen({
  route,
  navigation,
}: NativeStackScreenProps<PoojaStackParamList, "PunditPick">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const { offeringId, mode } = route.params;
  const q = useQuery({
    queryKey: ["pundits"],
    queryFn: () => paged<Pundit>("/api/v1/pundits/"),
    retry: 1,
  });
  const pundits = useMemo(() => {
    const raw = q.data ?? [];
    return raw.length > 0 ? raw : (FALLBACK_PUNDITS as Pundit[]);
  }, [q.data]);

  if (q.isPending && !q.data) return <Centered />;
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 28 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={T.accent} />
      }
    >
      <Text style={styles.head}>{tr(lang, "pundits")}</Text>
      {pundits.map((p) => (
        <Pressable
          key={p.id}
          style={styles.row}
          onPress={() =>
            navigation.navigate("SlotPick", {
              offeringId,
              mode,
              punditId: p.id,
              punditName: p.user.full_name,
            })
          }
        >
          <Text style={styles.rowHi}>{p.user.full_name}</Text>
          <Text style={styles.rowMeta}>★ {p.rating}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function SlotPickScreen({
  route,
  navigation,
}: NativeStackScreenProps<PoojaStackParamList, "SlotPick">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const { offeringId, mode, punditId, punditName } = route.params;
  const [date, setDate] = useState(tomorrowISO());
  const demoOff = getFallbackOfferingById(offeringId);
  const offQ = useQuery({
    queryKey: ["offering-mini", offeringId],
    queryFn: () => api<{ name: string; name_hindi: string }>(`/api/v1/poojas/offerings/${offeringId}/`),
    enabled: !demoOff,
    retry: 1,
  });
  const offeringName = preferDevanagari(lang)
    ? demoOff?.name_hindi || demoOff?.name || offQ.data?.name_hindi || offQ.data?.name || ""
    : demoOff?.name || offQ.data?.name || "";
  const q = useQuery({
    queryKey: ["slots", offeringId, punditId, date, mode],
    queryFn: () =>
      paged<Slot>(
        `/api/v1/bookings/slots/?offering=${offeringId}&pundit=${punditId}&date=${date}&mode=${mode}`,
      ),
    retry: 1,
  });

  const slots = useMemo(() => {
    const raw = q.data ?? [];
    if (raw.length > 0) return raw;
    if (isDemoOfferingId(offeringId)) return buildDemoSlots(date) as Slot[];
    return [];
  }, [q.data, offeringId, date]);

  const showDemoHint = isDemoOfferingId(offeringId) && slots.some((s) => isDemoSlotId(s.id));

  if (q.isPending && !q.data && !isDemoOfferingId(offeringId)) return <Centered />;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 28 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={T.accent} />
      }
    >
      <Text style={styles.head}>{tr(lang, "slots")}</Text>
      <Text style={styles.muted}>Pundit: {punditName}</Text>
      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} />
      {showDemoHint ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{tr(lang, "demoSlotsHint")}</Text>
        </View>
      ) : null}
      {!isDemoOfferingId(offeringId) && (q.data?.length ?? 0) === 0 && !q.isPending ? (
        <Text style={styles.muted}>No slots — try another date or run seed.</Text>
      ) : null}
      {slots.map((s) => (
        <Pressable
          key={s.id}
          style={styles.row}
          onPress={() =>
            navigation.navigate("Sankalp", {
              slotId: s.id,
              mode,
              offeringId,
              offeringName,
            })
          }
        >
          <Text style={styles.rowHi}>
            {s.date} {s.start_time} – {s.end_time} ({s.mode})
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function SankalpScreen({
  route,
  navigation,
}: NativeStackScreenProps<PoojaStackParamList, "Sankalp">) {
  const lang = useLangStore((s) => s.lang);
  const { slotId, mode, offeringId, offeringName } = route.params;
  const [sankalpName, setSankalpName] = useState("");
  const [city, setCity] = useState("");
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [pc, setPc] = useState("1");
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.head}>{tr(lang, "sankalp")}</Text>
      <Field label="Name / नाम" value={sankalpName} onChange={setSankalpName} />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="Occasion" value={occasion} onChange={setOccasion} />
      <Field label="Notes" value={notes} onChange={setNotes} multiline />
      <Field label="Participants" value={pc} onChange={setPc} keyboard="numeric" />
      <Pressable
        style={styles.primary}
        onPress={() =>
          navigation.navigate("BookingConfirm", {
            slotId,
            mode,
            offeringId,
            offeringName,
            sankalpName,
            sankalpCity: city,
            sankalpOccasion: occasion,
            sankalpNotes: notes,
            participantCount: Math.max(1, parseInt(pc, 10) || 1),
          })
        }
      >
        <Text style={styles.primaryTx}>{tr(lang, "confirmBooking")}</Text>
      </Pressable>
    </ScrollView>
  );
}

export function BookingConfirmScreen({
  route,
  navigation,
}: NativeStackScreenProps<PoojaStackParamList, "BookingConfirm">) {
  const lang = useLangStore((s) => s.lang);
  const p = route.params;
  const demoSlot = isDemoSlotId(p.slotId);
  const m = useMutation({
    mutationFn: async () => {
      const created = await api<{ booking: { id: string } }>("/api/v1/bookings/", {
        method: "POST",
        body: JSON.stringify({
          slot_id: p.slotId,
          mode: p.mode,
          sankalp_name: p.sankalpName,
          sankalp_city: p.sankalpCity,
          sankalp_occasion: p.sankalpOccasion,
          sankalp_notes: p.sankalpNotes,
          participant_count: p.participantCount,
        }),
      });
      await api(`/api/v1/bookings/${created.booking.id}/confirm-without-payment/`, {
        method: "POST",
      });
      return created.booking.id;
    },
    onSuccess: () => {
      Alert.alert(tr(lang, "success"), "Booking confirmed (no payment).", [
        { text: "OK", onPress: () => navigation.popToTop() },
      ]);
    },
    onError: (e) => Alert.alert("Error", e instanceof Error ? e.message : "Failed"),
  });
  return (
    <View style={styles.rootPad}>
      <Text style={styles.head}>{p.offeringName}</Text>
      <Text style={styles.body}>
        {p.mode} · {p.sankalpName || "—"}
      </Text>
      {demoSlot ? (
        <View style={[styles.banner, { marginTop: 12 }]}>
          <Text style={styles.bannerText}>{tr(lang, "demoBookingBlocked")}</Text>
        </View>
      ) : null}
      <Pressable
        style={[styles.primary, demoSlot && styles.primaryDisabled]}
        onPress={() => m.mutate()}
        disabled={m.isPending || demoSlot}
      >
        {m.isPending ? (
          <ActivityIndicator color={T.primaryBtnText} />
        ) : (
          <Text style={styles.primaryTx}>{tr(lang, "confirmBooking")}</Text>
        )}
      </Pressable>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  multiline?: boolean;
  keyboard?: "numeric";
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 80 }]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboard === "numeric" ? "numeric" : "default"}
      />
    </>
  );
}

function Centered() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={T.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgPage },
  pad: { padding: 16, paddingBottom: 48 },
  rootPad: { flex: 1, backgroundColor: T.bgPage, padding: 16 },
  head: { fontSize: 22, fontWeight: "800", color: T.heading, marginBottom: 12 },
  banner: {
    backgroundColor: T.bannerBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.bannerBorder,
  },
  bannerText: { color: T.bannerText, fontSize: 12, lineHeight: 18, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  tile: {
    width: "48%",
    backgroundColor: T.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.borderHair,
    minHeight: 110,
    ...E.cardSubtle,
  },
  tileOmWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.thumbBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileOm: { color: T.om, fontSize: 18, fontWeight: "700" },
  tileHi: { fontWeight: "700", color: T.text, fontSize: 15 },
  tileEn: { color: T.textMuted, fontSize: 11, marginTop: 6 },
  row: {
    backgroundColor: T.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  rowHi: { fontWeight: "700", fontSize: 16, color: T.text },
  rowMeta: { color: T.textSecondary, marginTop: 6, fontSize: 13 },
  empty: { color: T.textMuted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  body: { color: T.textSecondary, marginBottom: 16 },
  label: { fontWeight: "600", marginBottom: 6, color: T.heading },
  input: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: T.inputBg,
    color: T.text,
  },
  rowBtns: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    backgroundColor: T.primaryBtn,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnTx: { color: T.primaryBtnText, fontWeight: "700" },
  primary: {
    marginTop: 20,
    backgroundColor: T.primaryBtn,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryDisabled: { opacity: 0.45 },
  primaryTx: { color: T.primaryBtnText, fontWeight: "800", fontSize: 16 },
  muted: { color: T.textMuted, marginBottom: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bgPage },
});
