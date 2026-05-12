import type { ReactElement } from "react";
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";

export type TabBarRouteName = "HomeTab" | "LiveTab" | "BookTab" | "ShopTab" | "ProfileTab";

type Props = {
  routeName: TabBarRouteName;
  color: string;
  size?: number;
};

/** Tab icons without @expo/vector-icons (avoids Metro vendor resolution issues on some Windows/OneDrive setups). */
export function TabBarSvgIcon({ routeName, color, size = 24 }: Props): ReactElement {
  const s = size;
  const stroke = color;
  const w = 2;
  const cap = "round" as const;
  const join = "round" as const;

  switch (routeName) {
    case "HomeTab":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" accessibilityRole="image">
          <Path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <Polyline
            points="9,22 9,12 15,12 15,22"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </Svg>
      );
    case "LiveTab":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" accessibilityRole="image">
          <Polygon
            points="23,7 16,12 23,17 23,7"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <Rect
            x="1"
            y="5"
            width="15"
            height="14"
            rx="2"
            ry="2"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </Svg>
      );
    case "BookTab":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" accessibilityRole="image">
          <Path
            d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <Path
            d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </Svg>
      );
    case "ShopTab":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" accessibilityRole="image">
          <Path
            d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <Line x1="3" y1="6" x2="21" y2="6" stroke={stroke} strokeWidth={w} strokeLinecap={cap} />
          <Path
            d="M16 10a4 4 0 01-8 0"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
        </Svg>
      );
    case "ProfileTab":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" accessibilityRole="image">
          <Path
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
            fill="none"
            stroke={stroke}
            strokeWidth={w}
            strokeLinecap={cap}
            strokeLinejoin={join}
          />
          <Circle cx="12" cy="7" r="4" fill="none" stroke={stroke} strokeWidth={w} />
        </Svg>
      );
    default:
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="3" fill="none" stroke={stroke} strokeWidth={w} />
        </Svg>
      );
  }
}
