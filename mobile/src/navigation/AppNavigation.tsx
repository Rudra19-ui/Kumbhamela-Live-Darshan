import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DevLoginScreen } from "../screens/DevLoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LiveHomeScreen, LivePlayerScreen } from "../screens/live/LiveScreens";
import {
  BookingConfirmScreen,
  CategoriesScreen,
  OfferingDetailScreen,
  OfferingsScreen,
  PunditPickScreen,
  SankalpScreen,
  SlotPickScreen,
} from "../screens/pooja/PoojaFlowScreens";
import {
  BookingDetailScreen,
  BookingsScreen,
  OrderDetailScreen,
  OrdersScreen,
  ProfileHomeScreen,
  SettingsScreen,
} from "../screens/profile/ProfileScreens";
import { CartScreen, CheckoutScreen, ProductDetailScreen, ShopHomeScreen } from "../screens/shop/ShopScreens";
import { TabBarSvgIcon, type TabBarRouteName } from "../components/TabBarSvgIcon";
import { tr } from "../i18n/strings";
import { elevations as E, theme as T } from "../theme/colors";
import { useAuthStore } from "../store/authStore";
import { useLangStore } from "../store/langStore";
import type {
  LiveStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  PoojaStackParamList,
  RootStackParamList,
  ShopStackParamList,
} from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const BookStack = createNativeStackNavigator<PoojaStackParamList>();
const LiveStack = createNativeStackNavigator<LiveStackParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function BookNavigator() {
  return (
    <BookStack.Navigator
      screenOptions={{
        headerTintColor: T.headerTint,
        headerStyle: { backgroundColor: T.headerBg },
        headerTitleStyle: { color: T.headerTitle, fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: T.bgPage },
      }}
    >
      <BookStack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "पूजा · Pooja" }}
      />
      <BookStack.Screen name="Offerings" component={OfferingsScreen} options={{ title: "Offerings" }} />
      <BookStack.Screen name="OfferingDetail" component={OfferingDetailScreen} options={{ title: "Detail" }} />
      <BookStack.Screen name="PunditPick" component={PunditPickScreen} options={{ title: "Pundit" }} />
      <BookStack.Screen name="SlotPick" component={SlotPickScreen} options={{ title: "Slots" }} />
      <BookStack.Screen name="Sankalp" component={SankalpScreen} options={{ title: "Sankalp" }} />
      <BookStack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ title: "Confirm" }} />
    </BookStack.Navigator>
  );
}

function LiveNavigator() {
  return (
    <LiveStack.Navigator
      screenOptions={{
        headerTintColor: T.headerTint,
        headerStyle: { backgroundColor: T.headerBg },
        headerTitleStyle: { color: T.headerTitle, fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: T.bgPage },
      }}
    >
      <LiveStack.Screen name="LiveHome" component={LiveHomeScreen} options={{ title: "Live" }} />
      <LiveStack.Screen name="LivePlayer" component={LivePlayerScreen} options={{ title: "Stream" }} />
    </LiveStack.Navigator>
  );
}

function ShopNavigator() {
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerTintColor: T.headerTint,
        headerStyle: { backgroundColor: T.headerBg },
        headerTitleStyle: { color: T.headerTitle, fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: T.bgPage },
      }}
    >
      <ShopStack.Screen name="ShopHome" component={ShopHomeScreen} options={{ title: "Shop" }} />
      <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product" }} />
      <ShopStack.Screen name="Cart" component={CartScreen} options={{ title: "Cart" }} />
      <ShopStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
    </ShopStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerTintColor: T.headerTint,
        headerStyle: { backgroundColor: T.headerBg },
        headerTitleStyle: { color: T.headerTitle, fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: T.bgPage },
      }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileHomeScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Bookings" component={BookingsScreen} options={{ title: "Bookings" }} />
      <ProfileStack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: "Booking" }} />
      <ProfileStack.Screen name="Orders" component={OrdersScreen} options={{ title: "Orders" }} />
      <ProfileStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const lang = useLangStore((s) => s.lang);
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: T.tabBar,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: bottomPad,
          height: 58 + bottomPad,
          ...E.tabBar,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
        tabBarIcon: ({ color }) => (
          <TabBarSvgIcon routeName={route.name as TabBarRouteName} color={color} size={24} />
        ),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: tr(lang, "home"), tabBarLabel: tr(lang, "home") }}
      />
      <Tab.Screen
        name="LiveTab"
        component={LiveNavigator}
        options={{ title: tr(lang, "live"), tabBarLabel: tr(lang, "live") }}
      />
      <Tab.Screen
        name="BookTab"
        component={BookNavigator}
        options={{ title: tr(lang, "pooja"), tabBarLabel: tr(lang, "pooja") }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopNavigator}
        options={{ title: tr(lang, "shop"), tabBarLabel: tr(lang, "shop") }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ title: tr(lang, "profile"), tabBarLabel: tr(lang, "profile") }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bgPage }}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        key={accessToken ? "in" : "out"}
        screenOptions={{ headerShown: false }}
      >
        {accessToken ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="DevLogin" component={DevLoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
