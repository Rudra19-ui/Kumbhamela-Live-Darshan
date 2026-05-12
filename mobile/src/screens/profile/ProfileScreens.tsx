import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { LanguageButton } from "../../components/LanguageButton";
import { IconCalendar, IconChevronRight, IconPackage, IconSettings } from "../../components/ProfileIcons";
import { api } from "../../api/client";
import { paged } from "../../api/paged";
import { preferDevanagari } from "../../i18n/localeDisplay";
import { tr } from "../../i18n/strings";
import type { ProfileStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useLangStore } from "../../store/langStore";
import { elevations as E, theme as T } from "../../theme/colors";

type BookingRow = {
  id: string;
  booking_number: string;
  status: string;
  mode: string;
  total_amount: string;
  slot: { date: string; start_time: string; offering: { name: string; name_hindi: string } };
};

type BookingDetail = BookingRow & {
  qr_code_data: string;
  sankalp_name: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_amount: string;
  pickup_otp: string;
  items: { name: string; quantity: number }[];
};

export function ProfileHomeScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, "ProfileHome">) {
  const lang = useLangStore((s) => s.lang);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const insets = useSafeAreaInsets();
  const initial = (user?.full_name || "?").trim().charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.profileScroll,
        { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 32 + insets.bottom },
      ]}
    >
      <View style={styles.profileTopRow}>
        <View style={styles.profileTitleBlock}>
          <Text style={styles.profileTitle}>{tr(lang, "profile")}</Text>
          <Text style={styles.profileTagline}>{tr(lang, "profileTagline")}</Text>
        </View>
        <LanguageButton variant="profile" />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initial}</Text>
        </View>
        <View style={styles.heroCol}>
          <Text style={styles.heroName}>{user?.full_name || "—"}</Text>
          <Text style={styles.heroPhone}>{user?.phone}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipTx}>
              {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace(/_/g, " ")
                : tr(lang, "roleDevotee")}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{tr(lang, "accountSection")}</Text>
      <View style={styles.menuGroup}>
        <Pressable
          style={styles.menuRow}
          onPress={() => navigation.navigate("Bookings")}
          android_ripple={{ color: T.ripple }}
        >
          <View style={styles.menuIcon}>
            <IconCalendar color={T.accent} size={22} />
          </View>
          <Text style={styles.menuLabel}>{tr(lang, "myBookings")}</Text>
          <IconChevronRight color={T.iconMuted} size={20} />
        </Pressable>
        <View style={styles.menuSep} />
        <Pressable
          style={styles.menuRow}
          onPress={() => navigation.navigate("Orders")}
          android_ripple={{ color: T.ripple }}
        >
          <View style={styles.menuIcon}>
            <IconPackage color={T.accent} size={22} />
          </View>
          <Text style={styles.menuLabel}>{tr(lang, "myOrders")}</Text>
          <IconChevronRight color={T.iconMuted} size={20} />
        </Pressable>
        <View style={styles.menuSep} />
        <Pressable
          style={styles.menuRow}
          onPress={() => navigation.navigate("Settings")}
          android_ripple={{ color: T.ripple }}
        >
          <View style={styles.menuIcon}>
            <IconSettings color={T.accent} size={22} />
          </View>
          <Text style={styles.menuLabel}>{tr(lang, "settings")}</Text>
          <IconChevronRight color={T.iconMuted} size={20} />
        </Pressable>
      </View>

      <Pressable style={styles.logoutBtn} onPress={() => clear()} android_ripple={{ color: T.rippleLogout }}>
        <Text style={styles.logoutBtnTx}>{tr(lang, "logout")}</Text>
      </Pressable>

      <Text style={styles.footerNote}>KumbhConnect</Text>
    </ScrollView>
  );
}

export function BookingsScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, "Bookings">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const q = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => paged<BookingRow>("/api/v1/bookings/"),
    retry: 1,
  });
  if (q.isPending && !q.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 24 + insets.bottom }]}
    >
      {!q.data?.length ? (
        <Text style={styles.empty}>{tr(lang, "myBookings")} — no items yet.</Text>
      ) : (
        q.data.map((b) => (
          <Pressable
            key={b.id}
            style={styles.card}
            onPress={() => navigation.navigate("BookingDetail", { bookingId: b.id })}
          >
            <Text style={styles.hi}>{b.booking_number}</Text>
            <Text style={styles.meta}>
              {preferDevanagari(lang)
                ? b.slot?.offering?.name_hindi || b.slot?.offering?.name
                : b.slot?.offering?.name}{" "}
              · {b.status}
            </Text>
            <Text style={styles.price}>₹{b.total_amount}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export function BookingDetailScreen({
  route,
}: NativeStackScreenProps<ProfileStackParamList, "BookingDetail">) {
  const lang = useLangStore((s) => s.lang);
  const { bookingId } = route.params;
  const q = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => api<BookingDetail>(`/api/v1/bookings/${bookingId}/`),
    retry: 1,
  });
  if (q.isPending || !q.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }
  const b = q.data;
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.head}>{b.booking_number}</Text>
      <Text style={styles.meta}>Status: {b.status}</Text>
      <Text style={styles.body}>
        {preferDevanagari(lang)
          ? b.slot?.offering?.name_hindi || b.slot?.offering?.name
          : b.slot?.offering?.name}
      </Text>
      {b.mode === "offline" && b.qr_code_data ? (
        <View style={styles.qrBox}>
          <Text style={styles.label}>Check-in QR</Text>
          <QRCode value={b.qr_code_data} size={200} />
        </View>
      ) : null}
      {b.sankalp_name ? <Text style={styles.body}>Sankalp: {b.sankalp_name}</Text> : null}
    </ScrollView>
  );
}

export function OrdersScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, "Orders">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const q = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => paged<OrderRow>("/api/v1/marketplace/orders/"),
    retry: 1,
  });
  if (q.isPending && !q.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 24 + insets.bottom }]}
    >
      {!q.data?.length ? (
        <Text style={styles.empty}>{tr(lang, "myOrders")} — no items yet.</Text>
      ) : (
        q.data.map((o) => (
          <Pressable
            key={o.id}
            style={styles.card}
            onPress={() => navigation.navigate("OrderDetail", { orderId: o.id })}
          >
            <Text style={styles.hi}>{o.order_number}</Text>
            <Text style={styles.meta}>{o.status}</Text>
            <Text style={styles.price}>₹{o.total_amount}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export function OrderDetailScreen({ route }: NativeStackScreenProps<ProfileStackParamList, "OrderDetail">) {
  const { orderId } = route.params;
  const q = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api<OrderRow>(`/api/v1/marketplace/orders/${orderId}/`),
    retry: 1,
  });
  const lang = useLangStore((s) => s.lang);
  if (q.isPending || !q.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }
  const o = q.data;
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.head}>{o.order_number}</Text>
      <Text style={styles.meta}>{o.status}</Text>
      {o.pickup_otp ? (
        <Text style={styles.otp}>
          {tr(lang, "pickupOtp")}: {o.pickup_otp}
        </Text>
      ) : null}
      {o.items?.map((it, i) => (
        <Text key={i} style={styles.body}>
          {it.name} × {it.quantity}
        </Text>
      ))}
    </ScrollView>
  );
}

export function SettingsScreen() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 24 + insets.bottom }]}
    >
      <Text style={styles.head}>{tr(lang, "settings")}</Text>
      <Text style={styles.label}>{tr(lang, "language")}</Text>
      <View style={styles.langGroup}>
        <Pressable
          style={[styles.langRow, lang === "hi" && styles.langRowOn]}
          onPress={() => setLang("hi")}
        >
          <Text style={styles.langNative}>हिन्दी</Text>
          <Text style={styles.langSub}>Hindi</Text>
          {lang === "hi" ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
        <Pressable
          style={[styles.langRow, lang === "mr" && styles.langRowOn]}
          onPress={() => setLang("mr")}
        >
          <Text style={styles.langNative}>मराठी</Text>
          <Text style={styles.langSub}>Marathi</Text>
          {lang === "mr" ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
        <Pressable
          style={[styles.langRow, lang === "en" && styles.langRowOn]}
          onPress={() => setLang("en")}
        >
          <Text style={styles.langNative}>English</Text>
          <Text style={styles.langSub}>English</Text>
          {lang === "en" ? <Text style={styles.langCheck}>✓</Text> : null}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgPage },
  profileScroll: { paddingHorizontal: 18 },
  pad: { padding: 16, paddingBottom: 40 },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  profileTitleBlock: { flex: 1, minWidth: 0 },
  profileTitle: { fontSize: 28, fontWeight: "800", color: T.heading, letterSpacing: -0.5 },
  profileTagline: { marginTop: 6, fontSize: 14, color: T.textMuted },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.card,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: T.thumbBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: `${T.accent}40`,
  },
  avatarTxt: { fontSize: 26, fontWeight: "800", color: T.accent },
  heroCol: { flex: 1, minWidth: 0 },
  heroName: { fontSize: 19, fontWeight: "800", color: T.text },
  heroPhone: { marginTop: 6, fontSize: 15, color: T.textSecondary },
  roleChip: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: T.bannerBg,
    borderWidth: 1,
    borderColor: T.bannerBorder,
  },
  roleChipTx: { fontSize: 12, fontWeight: "700", color: T.bannerText },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "800",
    color: T.heading,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  menuGroup: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: T.surface,
  },
  menuIcon: { width: 44, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: "700", color: T.text },
  menuSep: { height: StyleSheet.hairlineWidth, backgroundColor: T.borderHair, marginLeft: 56 },
  logoutBtn: {
    marginTop: 28,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: T.logoutBorder,
    backgroundColor: T.logoutBg,
  },
  logoutBtnTx: { color: T.logoutText, fontWeight: "800", fontSize: 15 },
  footerNote: {
    marginTop: 36,
    textAlign: "center",
    fontSize: 12,
    color: T.textMuted,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  head: { fontSize: 22, fontWeight: "800", color: T.heading, marginBottom: 12 },
  card: {
    backgroundColor: T.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  hi: { fontWeight: "800", fontSize: 16, color: T.text },
  meta: { color: T.textMuted, marginTop: 6, fontSize: 14 },
  price: { color: T.price, fontWeight: "800", marginTop: 10, fontSize: 16 },
  body: { marginTop: 10, color: T.textSecondary, lineHeight: 22, fontSize: 15 },
  empty: { color: T.textMuted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  label: { marginBottom: 10, fontWeight: "700", color: T.heading, fontSize: 14 },
  otp: { fontSize: 22, fontWeight: "800", color: T.success, marginVertical: 12 },
  qrBox: { alignItems: "center", marginTop: 20, padding: 16, backgroundColor: T.surface, borderRadius: 16 },
  langGroup: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: T.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.borderHair,
  },
  langRowOn: { backgroundColor: T.chipOnBg },
  langNative: { flex: 1, fontSize: 17, fontWeight: "700", color: T.text },
  langSub: { fontSize: 13, color: T.textMuted, marginRight: 12 },
  langCheck: { fontSize: 18, fontWeight: "800", color: T.success },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bgPage },
});
