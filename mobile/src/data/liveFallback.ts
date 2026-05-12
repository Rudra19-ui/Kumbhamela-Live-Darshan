/** Mux public test HLS — works in Expo AV for demo / offline. */
export const DEMO_HLS_PRIMARY = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export type FallbackFeed = {
  id: string;
  name: string;
  name_hindi: string;
  location_description: string;
  camera_type: string;
  stream_url_hls: string;
  is_live: boolean;
  viewer_count: number;
};

export const FALLBACK_FEEDS: FallbackFeed[] = [
  {
    id: "fb-feed-sangam",
    name: "Main Sangam",
    name_hindi: "मुख्य संगम",
    location_description: "Triveni — wide view of the bathing ghats.",
    camera_type: "public",
    stream_url_hls: DEMO_HLS_PRIMARY,
    is_live: true,
    viewer_count: 8420,
  },
  {
    id: "fb-feed-aarti",
    name: "Aarti stage",
    name_hindi: "आरती मंच",
    location_description: "Evening Ganga aarti and lamps.",
    camera_type: "aarti",
    stream_url_hls: DEMO_HLS_PRIMARY,
    is_live: true,
    viewer_count: 3102,
  },
  {
    id: "fb-feed-mandap",
    name: "Pooja mandap",
    name_hindi: "पूजा मंडप",
    location_description: "Reserved rituals and sankalp area.",
    camera_type: "pooja_mandap",
    stream_url_hls: DEMO_HLS_PRIMARY,
    is_live: false,
    viewer_count: 412,
  },
  {
    id: "fb-feed-crowd",
    name: "Crowd & routes",
    name_hindi: "भीड़ व मार्ग",
    location_description: "Helps plan movement during peak snan.",
    camera_type: "crowd",
    stream_url_hls: DEMO_HLS_PRIMARY,
    is_live: true,
    viewer_count: 12050,
  },
];

export type FallbackSchedule = {
  id: string;
  camera_feed: string;
  title: string;
  title_hindi: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  description: string;
  is_free: boolean;
  entry_price: string | null;
};

export const FALLBACK_SCHEDULES: FallbackSchedule[] = [
  {
    id: "fb-sch-1",
    camera_feed: "",
    title: "Morning Ganga Aarti",
    title_hindi: "प्रातः गंगा आरती",
    start_datetime: "2026-01-14T05:30:00+05:30",
    end_datetime: "2026-01-14T06:30:00+05:30",
    event_type: "aarti",
    description: "Join virtually or plan to be near the main ghat.",
    is_free: true,
    entry_price: null,
  },
  {
    id: "fb-sch-2",
    camera_feed: "",
    title: "Shahi Snan — Mauni Amavasya",
    title_hindi: "शाही स्नान — मौनी अमावस्या",
    start_datetime: "2026-01-29T03:00:00+05:30",
    end_datetime: "2026-01-29T14:00:00+05:30",
    event_type: "snan",
    description: "Peak day — follow official crowd advisories.",
    is_free: true,
    entry_price: null,
  },
  {
    id: "fb-sch-3",
    camera_feed: "",
    title: "Special evening darshan",
    title_hindi: "विशेष संध्या दर्शन",
    start_datetime: "2026-02-01T18:00:00+05:30",
    end_datetime: "2026-02-01T19:30:00+05:30",
    event_type: "special",
    description: "Lamps, bhajans, and live commentary.",
    is_free: true,
    entry_price: null,
  },
];
