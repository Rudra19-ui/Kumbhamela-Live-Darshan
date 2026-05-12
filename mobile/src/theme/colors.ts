/**
 * KumbhConnect — refined saffron, amber & cream theme.
 * Warm paper backgrounds, deep→bright hero gradient, antique gold accents.
 */

export const theme = {
  /** Page canvas — soft warm paper */
  bg: "#F7F2EC",
  bgPage: "#FAF6F0",
  /** Slightly tinted card zones */
  surface: "#FFFFFF",
  surfaceMuted: "#FFF7ED",
  surfaceWarm: "#FFFBF5",
  /** Borders — dusty rose–peach */
  border: "#EDD5C5",
  borderStrong: "#E4BCA0",
  borderHair: "#E8DDD4",
  /** Typography — stone family for clarity */
  text: "#1C1917",
  textSecondary: "#57534E",
  textMuted: "#78716C",
  textSoft: "#A8A29E",
  /** Primary actions — vivid saffron-orange */
  accent: "#EA580C",
  accentLight: "#FB923C",
  accentDeep: "#C2410C",
  saffron: "#F59E0B",
  gold: "#B45309",
  /** Solid hero fallback (under gradient on some layouts) */
  hero: "#C2410C",
  heroGradientTop: "#7C2D12",
  heroGradientMid: "#C2410C",
  heroGradientBottom: "#FB923C",
  heroText: "#FFFBEB",
  heroTextSoft: "rgba(255, 251, 235, 0.88)",
  tint: "#EA580C",
  /** Info / demo strips */
  bannerBg: "#FFF7ED",
  bannerBorder: "#FDBA74",
  bannerText: "#9A3412",
  iconMuted: "#A8A29E",
  /** Buttons */
  primaryBtn: "#EA580C",
  primaryBtnText: "#FFFFFF",
  secondaryLink: "#C2410C",
  price: "#DC2626",
  danger: "#B91C1C",
  success: "#15803D",
  chipOnBg: "#FFEDD5",
  chipOnBorder: "#EA580C",
  inputBg: "#FFFFFF",
  /** Tab bar — lifted cream */
  tabBar: "#FFFBF7",
  tabBorder: "#F0E0D4",
  tabInactive: "#A8A29E",
  headerBg: "#FFFBF7",
  headerTint: "#C2410C",
  headerTitle: "#1C1917",
  cardAccent: "#EA580C",
  thumbBg: "#FFEDD5",
  om: "#B45309",
  liveBadge: "#DC2626",
  liveBadgeText: "#FFFFFF",
  offBadge: "#A8A29E",
  offBadgeBg: "#F5F5F4",
  scheduleAccent: "#EA580C",
  playerTitle: "#FFFBEB",
  videoBg: "#0C0A09",
  logoutBorder: "#FCA5A5",
  logoutBg: "#FEF2F2",
  logoutText: "#B91C1C",
  ripple: "rgba(234, 88, 12, 0.14)",
  rippleLogout: "rgba(185, 28, 28, 0.12)",
  shadow: "#431407",
  modalBackdrop: "rgba(28, 25, 23, 0.45)",
  optionActiveBg: "#FFEDD5",
  remove: "#DC2626",
  sectionDot: "#D97706",
  heading: "#B45309",
  /** White pill on hero */
  heroBtnBg: "#FFFFFF",
  heroBtnText: "#C2410C",
} as const;

/** iOS shadows + Android elevation — warm terracotta tint */
export const elevations = {
  card: {
    shadowColor: "#431407",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  cardSubtle: {
    shadowColor: "#431407",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroBtn: {
    shadowColor: "#431407",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBar: {
    shadowColor: "#431407",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

export type AppTheme = typeof theme;
