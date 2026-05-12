import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { paged } from "../api/paged";
import { api } from "../api/client";
import { LanguageButton } from "../components/LanguageButton";
import {
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_PUNDITS,
} from "../data/homeFallback";
import { preferDevanagari } from "../i18n/localeDisplay";
import { tr } from "../i18n/strings";
import type { MainTabParamList } from "../navigation/types";
import { useLangStore } from "../store/langStore";
import { elevations as E, theme as T } from "../theme/colors";

type Cat = { id: string; name: string; name_hindi: string };
type Pundit = { id: string; rating: string; user: { full_name: string } };
type Product = {
  id: string;
  name: string;
  name_hindi: string;
  price: string;
  vendor: { shop_name: string };
};
type Announce = { id: string; title: string; title_hindi: string; body: string };

function pick<T>(live: T[] | undefined, fallback: T[], min = 1): T[] {
  const a = live ?? [];
  return a.length >= min ? a : fallback;
}

export function HomeScreen() {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const q = useQuery({
    queryKey: ["home-bundle"],
    queryFn: async () => {
      const [cats, pundits, products, ann] = await Promise.all([
        api<Cat[]>("/api/v1/poojas/categories/"),
        paged<Pundit>("/api/v1/pundits/"),
        paged<Product>("/api/v1/marketplace/products/"),
        api<Announce[]>("/api/v1/notifications/announcements/"),
      ]);
      return {
        cats: Array.isArray(cats) ? cats : [],
        pundits,
        products: products.slice(0, 8),
        ann: Array.isArray(ann) ? ann : [],
      };
    },
    retry: 1,
  });

  const display = useMemo(() => {
    const d = q.data;
    const usingFallback = !d || q.isError;
    const cats = pick(d?.cats, FALLBACK_CATEGORIES, 1);
    const pundits = pick(d?.pundits, FALLBACK_PUNDITS, 1);
    const products = pick(d?.products, FALLBACK_PRODUCTS, 1);
    const ann = pick(d?.ann, FALLBACK_ANNOUNCEMENTS, 1);
    return { cats, pundits, products, ann, usingFallback: usingFallback || (d && d.cats.length === 0) };
  }, [q.data, q.isError]);

  const loading = q.isPending && !q.data;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.contentGrow}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={q.isFetching}
          onRefresh={() => q.refetch()}
          tintColor={T.accent}
        />
      }
    >
      <View style={styles.heroShadowWrap}>
        <View style={[styles.heroClip, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
          <LinearGradient
            colors={[T.heroGradientTop, T.heroGradientMid, T.heroGradientBottom]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroInner} pointerEvents="box-none">
            <View style={styles.heroTopRow}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTitle}>KumbhConnect</Text>
                <Text style={styles.heroSub}>Prayagraj · {tr(lang, "liveDarshan")}</Text>
              </View>
              <LanguageButton variant="header" />
            </View>
            <Pressable style={styles.heroBtn} onPress={() => tabNav.navigate("LiveTab")}>
              <Text style={styles.heroBtnText}>{tr(lang, "watch")} →</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {display.usingFallback ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {q.isError
              ? "Offline / demo data — connect API for live content."
              : "Showing sample rows — pull to refresh when server is up."}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={T.accent} />
          <Text style={styles.loaderTxt}>Loading…</Text>
        </View>
      ) : null}

      <View style={styles.sectionBlock}>
        <Section title={tr(lang, "announcements")} />
        {display.ann.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardAccent} />
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>
                {preferDevanagari(lang) ? a.title_hindi || a.title : a.title}
              </Text>
              <Text style={styles.cardBody} numberOfLines={4}>
                {a.body}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <Section title={tr(lang, "categories")} />
        <View style={styles.grid}>
          {display.cats.map((c) => (
            <Pressable
              key={c.id}
              style={styles.tile}
              onPress={() =>
                tabNav.navigate("BookTab", {
                  screen: "Offerings",
                  params: {
                    categoryId: c.id,
                    categoryName: preferDevanagari(lang) ? c.name_hindi || c.name : c.name,
                  },
                })
              }
            >
              <View style={styles.tileIcon}>
                <Text style={styles.tileOm}>ॐ</Text>
              </View>
              <Text style={styles.tileHi}>
                {preferDevanagari(lang) ? c.name_hindi || c.name : c.name}
              </Text>
              <Text style={styles.tileEn}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Section title={tr(lang, "featuredPundits")} />
        <View style={styles.punditGrid}>
          {display.pundits.map((p) => (
            <Pressable
              key={p.id}
              style={styles.punditCard}
              onPress={() => tabNav.navigate("BookTab", { screen: "Categories" })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{(p.user?.full_name || "?").charAt(0)}</Text>
              </View>
              <Text style={styles.punditName} numberOfLines={2}>
                {p.user?.full_name}
              </Text>
              <Text style={styles.rating}>★ {p.rating}</Text>
              <Text style={styles.punditCta}>{tr(lang, "bookNow")}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.sectionBlock, { paddingBottom: 28 }]}>
        <Section title={tr(lang, "shopHighlights")} />
        <View style={styles.grid}>
          {display.products.map((p) => (
            <Pressable
              key={p.id}
              style={styles.tile}
              onPress={() =>
                tabNav.navigate("ShopTab", { screen: "ProductDetail", params: { productId: p.id } })
              }
            >
              <View style={styles.productThumb}>
                <Text style={styles.productThumbTxt}>₹</Text>
              </View>
              <Text style={styles.tileHi} numberOfLines={2}>
                {preferDevanagari(lang) ? p.name_hindi || p.name : p.name}
              </Text>
              <Text style={styles.price}>₹{p.price}</Text>
              <Text style={styles.vendor}>{p.vendor?.shop_name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Section({ title }: { title: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionDot} />
      <Text style={styles.section}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgPage },
  contentGrow: { flexGrow: 1 },
  heroShadowWrap: {
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: 24,
    ...E.card,
  },
  heroClip: {
    borderRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  heroInner: { position: "relative" },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroLeft: { flex: 1, minWidth: 0 },
  heroTitle: { color: T.heroText, fontSize: 26, fontWeight: "800" },
  heroSub: { color: T.heroTextSoft, marginTop: 6, fontSize: 14 },
  heroBtn: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: T.heroBtnBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    ...E.heroBtn,
  },
  heroBtnText: { color: T.heroBtnText, fontWeight: "800", fontSize: 15, letterSpacing: 0.3 },
  banner: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: T.bannerBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: T.bannerBorder,
    ...E.cardSubtle,
  },
  bannerText: { color: T.bannerText, fontSize: 12, textAlign: "center" },
  loader: { paddingVertical: 24, alignItems: "center" },
  loaderTxt: { color: T.textMuted, marginTop: 8 },
  sectionBlock: { marginTop: 6 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
    gap: 8,
  },
  sectionDot: {
    width: 5,
    height: 22,
    borderRadius: 5,
    backgroundColor: T.sectionDot,
  },
  section: {
    fontSize: 18,
    fontWeight: "800",
    color: T.heading,
    flex: 1,
  },
  card: {
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  cardAccent: { width: 5, backgroundColor: T.cardAccent },
  cardInner: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: T.text },
  cardBody: { marginTop: 8, color: T.textSecondary, lineHeight: 20, fontSize: 14 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 12,
    minHeight: 118,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.thumbBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  tileOm: { color: T.om, fontSize: 18, fontWeight: "700" },
  tileHi: { fontWeight: "700", fontSize: 14, color: T.text },
  tileEn: { color: T.textMuted, fontSize: 11, marginTop: 4 },
  price: { color: T.price, fontWeight: "800", marginTop: 6, fontSize: 16 },
  vendor: { color: T.textSoft, fontSize: 11, marginTop: 4 },
  productThumb: {
    height: 44,
    borderRadius: 10,
    backgroundColor: T.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  productThumbTxt: { fontSize: 20, color: T.accent, fontWeight: "800" },
  punditGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
    justifyContent: "space-between",
  },
  punditCard: {
    width: "48%",
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: T.borderHair,
    minHeight: 130,
    ...E.cardSubtle,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.thumbBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarTxt: { color: T.accent, fontSize: 20, fontWeight: "800" },
  punditName: { color: T.text, fontWeight: "700", fontSize: 14 },
  rating: { color: T.heading, marginTop: 6, fontSize: 13 },
  punditCta: { color: T.secondaryLink, fontWeight: "700", marginTop: 10, fontSize: 13 },
});
