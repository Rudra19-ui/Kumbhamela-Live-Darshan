import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  DevLogin: undefined;
  Main: undefined;
};

export type PoojaStackParamList = {
  Categories: undefined;
  Offerings: { categoryId: string; categoryName: string };
  OfferingDetail: { offeringId: string };
  PunditPick: { offeringId: string; mode: "online" | "offline" };
  SlotPick: {
    offeringId: string;
    mode: "online" | "offline";
    punditId: string;
    punditName: string;
  };
  Sankalp: {
    slotId: string;
    mode: "online" | "offline";
    offeringId: string;
    offeringName: string;
  };
  BookingConfirm: {
    slotId: string;
    mode: "online" | "offline";
    offeringId: string;
    offeringName: string;
    sankalpName: string;
    sankalpCity: string;
    sankalpOccasion: string;
    sankalpNotes: string;
    participantCount: number;
  };
};

export type LiveStackParamList = {
  LiveHome: undefined;
  LivePlayer: { feedId: string; title: string; hls: string };
};

export type ShopStackParamList = {
  ShopHome: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Bookings: undefined;
  BookingDetail: { bookingId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  LiveTab: undefined;
  BookTab: NavigatorScreenParams<PoojaStackParamList> | undefined;
  ShopTab: NavigatorScreenParams<ShopStackParamList> | undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
