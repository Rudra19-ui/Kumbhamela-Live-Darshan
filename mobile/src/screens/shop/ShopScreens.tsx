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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../api/client";
import { paged } from "../../api/paged";
import { FALLBACK_PRODUCTS, getFallbackProductById, isDemoProductId } from "../../data/homeFallback";
import { preferDevanagari } from "../../i18n/localeDisplay";
import { tr } from "../../i18n/strings";
import type { ShopStackParamList } from "../../navigation/types";
import { useCartStore } from "../../store/cartStore";
import { useLangStore } from "../../store/langStore";
import { elevations as E, theme as T } from "../../theme/colors";

type Product = {
  id: string;
  name: string;
  name_hindi: string;
  description?: string;
  price: string;
  discounted_price: string | null;
  stock_quantity: number;
  vendor: { id: string; shop_name: string };
};

export function ShopHomeScreen({ navigation }: NativeStackScreenProps<ShopStackParamList, "ShopHome">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const q = useQuery({
    queryKey: ["shop-products"],
    queryFn: () => paged<Product>("/api/v1/marketplace/products/"),
    retry: 1,
  });

  const products = useMemo(() => {
    const raw = q.data ?? [];
    return raw.length > 0 ? raw : (FALLBACK_PRODUCTS as unknown as Product[]);
  }, [q.data]);

  const usingDemo = q.isError || !q.data || q.data.length === 0;

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
      contentContainerStyle={[styles.pad, { paddingBottom: 28 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={T.accent} />
      }
    >
      <View style={styles.rowTop}>
        <Text style={styles.head}>दुकान · Shop</Text>
        <Pressable onPress={() => navigation.navigate("Cart")} hitSlop={8}>
          <Text style={styles.cartLink}>{tr(lang, "cart")} →</Text>
        </Pressable>
      </View>
      {usingDemo ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{tr(lang, "shopDemoBanner")}</Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {products.map((p) => {
          const display = preferDevanagari(lang) ? p.name_hindi || p.name : p.name;
          const unit = p.discounted_price || p.price;
          return (
            <Pressable
              key={p.id}
              style={styles.tile}
              onPress={() => navigation.navigate("ProductDetail", { productId: p.id })}
            >
              <View style={styles.thumb}>
                <Text style={styles.thumbTxt}>₹</Text>
              </View>
              <Text style={styles.tileTitle} numberOfLines={2}>
                {display}
              </Text>
              <Text style={styles.price}>₹{unit}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {p.vendor?.shop_name}
              </Text>
              {p.stock_quantity <= 5 ? (
                <Text style={styles.lowStock}>Low stock</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function ProductDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<ShopStackParamList, "ProductDetail">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const addLine = useCartStore((s) => s.addLine);
  const { productId } = route.params;
  const demo = getFallbackProductById(productId) as Product | undefined;
  const q = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api<Product>(`/api/v1/marketplace/products/${productId}/`),
    enabled: !demo,
    retry: 1,
  });

  const p = demo ?? q.data;
  if (!demo && (q.isPending || !q.data)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} size="large" />
      </View>
    );
  }
  if (!p) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Not found</Text>
      </View>
    );
  }

  const price = parseFloat(String(p.discounted_price || p.price));
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 28 + insets.bottom }]}
    >
      <View style={styles.heroThumb}>
        <Text style={styles.heroThumbTxt}>ॐ</Text>
      </View>
      <Text style={styles.hi}>
        {preferDevanagari(lang) ? p.name_hindi || p.name : p.name}
      </Text>
      <Text style={styles.price}>₹{p.discounted_price || p.price}</Text>
      {p.discounted_price ? (
        <Text style={styles.wasPrice}>Was ₹{p.price}</Text>
      ) : null}
      <Text style={styles.meta}>{p.vendor?.shop_name}</Text>
      <Text style={styles.stock}>In stock: {p.stock_quantity}</Text>
      {p.description ? <Text style={styles.desc}>{p.description}</Text> : null}
      {demo ? (
        <View style={[styles.banner, { marginTop: 12 }]}>
          <Text style={styles.bannerText}>{tr(lang, "shopDemoBanner")}</Text>
        </View>
      ) : null}
      <Pressable
        style={styles.primary}
        onPress={() => {
          addLine({
            productId: p.id,
            name: p.name,
            nameHindi: p.name_hindi,
            unitPrice: price,
            vendorId: p.vendor.id,
            vendorName: p.vendor.shop_name,
            quantity: 1,
          });
          Alert.alert(tr(lang, "cart"), "Added to cart");
        }}
      >
        <Text style={styles.primaryTx}>Add to cart</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={() => navigation.navigate("Cart")}>
        <Text style={styles.secondaryTx}>{tr(lang, "cart")}</Text>
      </Pressable>
    </ScrollView>
  );
}

export function CartScreen({ navigation }: NativeStackScreenProps<ShopStackParamList, "Cart">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const { lines, setQty, removeLine, clear } = useCartStore();
  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const hasDemo = lines.some((l) => isDemoProductId(l.productId));
  return (
    <View style={[styles.rootPad, { paddingBottom: insets.bottom }]}>
      <Text style={styles.head}>{tr(lang, "cart")}</Text>
      {hasDemo ? (
        <View style={[styles.banner, { marginBottom: 12 }]}>
          <Text style={styles.bannerText}>{tr(lang, "shopDemoCheckoutBlocked")}</Text>
        </View>
      ) : null}
      {lines.length === 0 ? (
        <Text style={styles.muted}>{tr(lang, "emptyCart")}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {lines.map((l) => (
            <View key={l.productId} style={styles.row}>
              <Text style={styles.hi}>
                {preferDevanagari(lang) ? l.nameHindi || l.name : l.name}
              </Text>
              <Text style={styles.meta}>₹{l.unitPrice} × {l.quantity}</Text>
              <View style={styles.rowBtns}>
                <Pressable onPress={() => setQty(l.productId, l.quantity - 1)}>
                  <Text style={styles.smallBtn}>-</Text>
                </Pressable>
                <Pressable onPress={() => setQty(l.productId, l.quantity + 1)}>
                  <Text style={styles.smallBtn}>+</Text>
                </Pressable>
                <Pressable onPress={() => removeLine(l.productId)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <Text style={styles.total}>Total ₹{total.toFixed(2)}</Text>
          <Pressable
            style={[styles.primary, hasDemo && styles.primaryDisabled]}
            onPress={() => navigation.navigate("Checkout")}
            disabled={hasDemo}
          >
            <Text style={styles.primaryTx}>{tr(lang, "checkout")}</Text>
          </Pressable>
          <Pressable onPress={() => clear()}>
            <Text style={styles.muted}>Clear cart</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

export function CheckoutScreen({ navigation }: NativeStackScreenProps<ShopStackParamList, "Checkout">) {
  const lang = useLangStore((s) => s.lang);
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const [pickup, setPickup] = useState<"self_pickup" | "stall_delivery">("self_pickup");
  const hasDemo = lines.some((l) => isDemoProductId(l.productId));
  const m = useMutation({
    mutationFn: () =>
      api("/api/v1/marketplace/orders/checkout-dev/", {
        method: "POST",
        body: JSON.stringify({
          pickup_type: pickup,
          lines: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
        }),
      }),
    onSuccess: () => {
      clear();
      Alert.alert(tr(lang, "success"), "Order placed (no payment).", [
        { text: "OK", onPress: () => navigation.navigate("ShopHome") },
      ]);
    },
    onError: (e) => Alert.alert("Error", e instanceof Error ? e.message : "Checkout failed"),
  });
  if (lines.length === 0) {
    return (
      <View style={styles.rootPad}>
        <Text style={styles.muted}>{tr(lang, "emptyCart")}</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.rootPad}>
      <Text style={styles.head}>{tr(lang, "checkout")}</Text>
      {hasDemo ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{tr(lang, "shopDemoCheckoutBlocked")}</Text>
        </View>
      ) : null}
      <Pressable
        style={[styles.chip, pickup === "self_pickup" && styles.chipOn]}
        onPress={() => setPickup("self_pickup")}
      >
        <Text style={styles.chipTx}>Self pickup</Text>
      </Pressable>
      <Pressable
        style={[styles.chip, pickup === "stall_delivery" && styles.chipOn]}
        onPress={() => setPickup("stall_delivery")}
      >
        <Text style={styles.chipTx}>Stall delivery</Text>
      </Pressable>
      <Pressable
        style={[styles.primary, (m.isPending || hasDemo) && styles.primaryDisabled]}
        onPress={() => m.mutate()}
        disabled={m.isPending || hasDemo}
      >
        {m.isPending ? <ActivityIndicator color={T.primaryBtnText} /> : <Text style={styles.primaryTx}>Confirm</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgPage },
  pad: { padding: 16, paddingBottom: 40 },
  rootPad: { flex: 1, backgroundColor: T.bgPage, padding: 16 },
  head: { fontSize: 22, fontWeight: "800", color: T.heading, marginBottom: 12 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cartLink: { color: T.secondaryLink, fontWeight: "700", fontSize: 15 },
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
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.borderHair,
    minHeight: 150,
    ...E.cardSubtle,
  },
  thumb: {
    height: 52,
    borderRadius: 12,
    backgroundColor: T.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  thumbTxt: { fontSize: 22, color: T.accent, fontWeight: "800" },
  tileTitle: { fontWeight: "700", fontSize: 14, color: T.text },
  price: { color: T.price, fontWeight: "800", marginTop: 8, fontSize: 16 },
  wasPrice: { color: T.textMuted, fontSize: 12, marginTop: 4, textDecorationLine: "line-through" },
  meta: { color: T.textMuted, fontSize: 12, marginTop: 6 },
  lowStock: { color: T.heading, fontSize: 11, marginTop: 6, fontWeight: "600" },
  row: {
    backgroundColor: T.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  heroThumb: {
    height: 120,
    borderRadius: 16,
    backgroundColor: T.thumbBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...E.cardSubtle,
  },
  heroThumbTxt: { fontSize: 48, color: T.om },
  hi: { fontWeight: "800", fontSize: 20, color: T.text },
  stock: { color: T.textSecondary, marginTop: 8 },
  desc: { marginTop: 14, color: T.textSecondary, lineHeight: 22, fontSize: 14 },
  primary: {
    marginTop: 16,
    backgroundColor: T.primaryBtn,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryDisabled: { opacity: 0.45 },
  primaryTx: { color: T.primaryBtnText, fontWeight: "800" },
  secondary: { marginTop: 12, alignItems: "center" },
  secondaryTx: { color: T.secondaryLink, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bgPage },
  rowBtns: { flexDirection: "row", gap: 16, marginTop: 8, alignItems: "center" },
  smallBtn: { fontSize: 22, fontWeight: "800", color: T.heading },
  remove: { color: T.remove },
  total: { fontSize: 18, fontWeight: "700", marginVertical: 12, color: T.text },
  muted: { color: T.textMuted, marginTop: 8 },
  chip: {
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: T.surface,
  },
  chipOn: { borderColor: T.chipOnBorder, backgroundColor: T.chipOnBg },
  chipTx: { color: T.text, fontWeight: "600" },
});
