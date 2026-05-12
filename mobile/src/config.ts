/**
 * On a physical device with Expo Go, replace with your PC's LAN IP, e.g.:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.42:8000
 * Android emulator (AVD) can use: http://10.0.2.2:8000
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
