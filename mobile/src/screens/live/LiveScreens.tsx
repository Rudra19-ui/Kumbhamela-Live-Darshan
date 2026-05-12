import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Video, ResizeMode } from "expo-av";
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
import { paged } from "../../api/paged";
import {
  DEMO_HLS_PRIMARY,
  FALLBACK_FEEDS,
  FALLBACK_SCHEDULES,
  type FallbackSchedule,
} from "../../data/liveFallback";
import { preferDevanagari } from "../../i18n/localeDisplay";
import { tr } from "../../i18n/strings";
import type { Lang } from "../../store/langStore";
import type { LiveStackParamList } from "../../navigation/types";
import { useLangStore } from "../../store/langStore";
import { elevations as E, theme as T } from "../../theme/colors";

type Feed = {
  id: string;
  name: string;
  name_hindi: string;
  stream_url_hls: string;
  is_live: boolean;
  viewer_count: number;
  location_description?: string;
  camera_type?: string;
};

type Schedule = {
  id: string;
  camera_feed: string;
  title: string;
  title_hindi: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  description?: string;
  is_free?: boolean;
  entry_price?: string | null;
};

function localeForLang(lang: Lang): string {
  if (lang === "mr") return "mr-IN";
  if (lang === "hi") return "hi-IN";
  return "en-IN";
}

function formatRange(lang: Lang, start: string, end: string): string {
  const loc = localeForLang(lang);
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime())) return "";
  const dOpts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  const tOpts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${a.toLocaleString(loc, { ...dOpts, ...tOpts })} – ${b.toLocaleString(loc, tOpts)}`;
}

export function LiveHomeScreen({ navigation }: NativeStackScreenProps<LiveStackParamList, "LiveHome">) {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();

  const q = useQuery({
    queryKey: ["live-bundle"],
    queryFn: async () => {
      const [feeds, schedules] = await Promise.all([
        paged<Feed>("/api/v1/streams/feeds/"),
        paged<Schedule>("/api/v1/streams/schedules/"),
      ]);
      return { feeds, schedules };
    },
    retry: 1,
  });

  const { feeds, schedules, usingDemo } = useMemo(() => {
    const rawF = q.data?.feeds;
    const rawS = q.data?.schedules;
    const feedsOut = rawF && rawF.length > 0 ? rawF : FALLBACK_FEEDS;
    const schedulesOut = rawS && rawS.length > 0 ? rawS : (FALLBACK_SCHEDULES as Schedule[]);
    const usingDemo = q.isError || !rawF || rawF.length === 0;
    return { feeds: feedsOut, schedules: schedulesOut, usingDemo };
  }, [q.data, q.isError]);

  const loading = q.isPending && !q.data;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.pad, { paddingBottom: 24 + insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} tintColor={T.accent} />
      }
    >
      <Text style={styles.intro}>{tr(lang, "liveIntro")}</Text>
      <Text style={styles.sectionLabel}>{tr(lang, "selectCamera")}</Text>

      {usingDemo ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{tr(lang, "liveDemoBanner")}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={T.accent} />
        </View>
      ) : null}

      {feeds.map((f) => {
        const title = preferDevanagari(lang) ? f.name_hindi || f.name : f.name;
        const hls = (f.stream_url_hls || "").trim() || DEMO_HLS_PRIMARY;
        return (
          <Pressable
            key={f.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("LivePlayer", {
                feedId: f.id,
                title,
                hls,
              })
            }
          >
            <View style={styles.cardTop}>
              <View style={styles.thumb}>
                <Text style={styles.thumbPlay}>▶</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  <View style={[styles.badge, f.is_live ? styles.badgeLive : styles.badgeOff]}>
                    <Text style={[styles.badgeTxt, f.is_live ? styles.badgeTxtLive : styles.badgeTxtOff]}>
                      {f.is_live ? tr(lang, "badgeLive") : tr(lang, "badgeSample")}
                    </Text>
                  </View>
                </View>
                {f.location_description ? (
                  <Text style={styles.loc} numberOfLines={2}>
                    {f.location_description}
                  </Text>
                ) : null}
                <Text style={styles.meta}>
                  ● {f.viewer_count.toLocaleString(localeForLang(lang))} {tr(lang, "viewers")}
                </Text>
                <Text style={styles.cta}>{tr(lang, "tapToWatch")}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>{tr(lang, "upcomingDarshan")}</Text>
      {schedules.map((s) => {
        const st = s as FallbackSchedule | Schedule;
        const title = preferDevanagari(lang) ? st.title_hindi || st.title : st.title;
        const range = formatRange(lang, st.start_datetime, st.end_datetime);
        return (
          <View key={st.id} style={styles.scheduleCard}>
            <View style={styles.scheduleAccent} />
            <View style={styles.scheduleInner}>
              <Text style={styles.scheduleType}>{(st.event_type || "").toUpperCase()}</Text>
              <Text style={styles.scheduleTitle}>{title}</Text>
              {range ? <Text style={styles.scheduleTime}>{range}</Text> : null}
              {st.description ? (
                <Text style={styles.scheduleDesc} numberOfLines={3}>
                  {st.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function LivePlayerScreen({ route }: NativeStackScreenProps<LiveStackParamList, "LivePlayer">) {
  const { title, hls } = route.params;
  return (
    <View style={styles.videoWrap}>
      <Text style={styles.playerTitle}>{title}</Text>
      <Video
        style={styles.video}
        source={{ uri: hls }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isMuted={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bgPage },
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  intro: { color: T.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  sectionLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: T.heading,
    marginBottom: 10,
  },
  sectionSpaced: { marginTop: 22 },
  banner: {
    backgroundColor: T.bannerBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.bannerBorder,
  },
  bannerText: { color: T.bannerText, fontSize: 12, lineHeight: 18, textAlign: "center" },
  loader: { paddingVertical: 32, alignItems: "center" },
  card: {
    backgroundColor: T.surface,
    borderRadius: 18,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  cardTop: { flexDirection: "row", padding: 12, gap: 12 },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: T.thumbBg,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlay: { color: T.accent, fontSize: 28, marginLeft: 4 },
  cardBody: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardTitle: { flex: 1, fontWeight: "800", fontSize: 16, color: T.text },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeLive: { backgroundColor: T.liveBadge },
  badgeOff: { backgroundColor: T.offBadgeBg },
  badgeTxt: { fontSize: 10, fontWeight: "800" },
  badgeTxtLive: { color: T.liveBadgeText },
  badgeTxtOff: { color: T.textSecondary },
  loc: { color: T.textMuted, fontSize: 12, marginTop: 6, lineHeight: 17 },
  meta: { color: T.heading, fontSize: 12, marginTop: 8 },
  cta: { color: T.secondaryLink, fontWeight: "700", fontSize: 13, marginTop: 10 },
  scheduleCard: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.borderHair,
    ...E.cardSubtle,
  },
  scheduleAccent: { width: 4, backgroundColor: T.scheduleAccent },
  scheduleInner: { flex: 1, padding: 14 },
  scheduleType: { color: T.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  scheduleTitle: { color: T.text, fontWeight: "700", fontSize: 15, marginTop: 4 },
  scheduleTime: { color: T.heading, fontSize: 13, marginTop: 8 },
  scheduleDesc: { color: T.textMuted, fontSize: 12, marginTop: 8, lineHeight: 18 },
  videoWrap: { flex: 1, backgroundColor: T.videoBg },
  playerTitle: { color: T.playerTitle, paddingHorizontal: 16, paddingVertical: 12, fontWeight: "700", fontSize: 16 },
  video: { flex: 1, minHeight: 240 },
});
