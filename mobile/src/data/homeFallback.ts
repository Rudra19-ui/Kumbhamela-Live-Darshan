/** Shown when API is unreachable so the home screen still looks complete in Expo Go. */
export const FALLBACK_ANNOUNCEMENTS = [
  {
    id: "fb-ann-1",
    title: "Mela updates",
    title_hindi: "मेला अपडेट",
    body: "Main snan dates and ghat routes will be announced here. Connect for live alerts.",
  },
  {
    id: "fb-ann-2",
    title: "Safety tips",
    title_hindi: "सुरक्षा सुझाव",
    body: "Stay hydrated, follow crowd marshals, and keep children within arm’s reach in dense areas.",
  },
];

export const FALLBACK_CATEGORIES = [
  { id: "fb-c1", name: "Ganga Pujan", name_hindi: "गंगा पूजन" },
  { id: "fb-c2", name: "Rudrabhishek", name_hindi: "रुद्राभिषेक" },
  { id: "fb-c3", name: "Satyanarayan Katha", name_hindi: "सत्यनारायण कथा" },
  { id: "fb-c4", name: "Mrityunjay Jaap", name_hindi: "मृत्युंजय जाप" },
  { id: "fb-c5", name: "Pitru Tarpan", name_hindi: "पितृ तर्पण" },
  { id: "fb-c6", name: "Durga Path", name_hindi: "दुर्गा पाठ" },
];

export type FallbackOffering = {
  id: string;
  name: string;
  name_hindi: string;
  base_price: string;
  duration_minutes: number;
  mode: "both" | "online" | "offline";
};

function fo(
  id: string,
  name: string,
  name_hindi: string,
  price: string,
  minutes: number,
  mode: FallbackOffering["mode"] = "both",
): FallbackOffering {
  return { id, name, name_hindi, base_price: price, duration_minutes: minutes, mode };
}

/** Demo offerings per fallback category id (so the booking flow has rows without the API). */
export const FALLBACK_OFFERINGS_BY_CATEGORY: Record<string, FallbackOffering[]> = {
  "fb-c1": [
    fo("fb-o-c1-1", "Sankalp Ganga Pujan", "संकल्प गंगा पूजन", "501", 45),
    fo("fb-o-c1-2", "Family Ganga Pujan", "पारिवारिक गंगा पूजन", "1101", 60),
  ],
  "fb-c2": [
    fo("fb-o-c2-1", "Laghu Rudrabhishek", "लघु रुद्राभिषेक", "2100", 90),
    fo("fb-o-c2-2", "Maha Rudrabhishek", "महा रुद्राभिषेक", "5100", 150),
  ],
  "fb-c3": [
    fo("fb-o-c3-1", "Satyanarayan Katha", "सत्यनारायण कथा", "1501", 120),
  ],
  "fb-c4": [
    fo("fb-o-c4-1", "Mrityunjay Jaap (1 lac)", "मृत्युंजय जाप (१ लाख)", "3500", 180),
  ],
  "fb-c5": [
    fo("fb-o-c5-1", "Pitru Tarpan", "पितृ तर्पण", "801", 60),
  ],
  "fb-c6": [
    fo("fb-o-c6-1", "Durga Saptashati Path", "दुर्गा सप्तशती पाठ", "2501", 240),
  ],
};

export function listFallbackOfferingsForCategory(categoryId: string): FallbackOffering[] {
  return FALLBACK_OFFERINGS_BY_CATEGORY[categoryId] ?? [
    fo(`fb-o-${categoryId}-x`, "General seva", "सामान्य सेवा", "501", 45),
  ];
}

export function getFallbackOfferingById(offeringId: string): FallbackOffering | undefined {
  for (const list of Object.values(FALLBACK_OFFERINGS_BY_CATEGORY)) {
    const hit = list.find((o) => o.id === offeringId);
    if (hit) return hit;
  }
  return undefined;
}

export function isDemoOfferingId(offeringId: string): boolean {
  return offeringId.startsWith("fb-o-");
}

export function isDemoSlotId(slotId: string): boolean {
  return slotId.startsWith("fb-slot-");
}

export type FallbackSlot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  mode: string;
};

export function buildDemoSlots(dateISO: string): FallbackSlot[] {
  return [
    { id: "fb-slot-1", date: dateISO, start_time: "09:00", end_time: "10:00", mode: "online" },
    { id: "fb-slot-2", date: dateISO, start_time: "15:00", end_time: "16:00", mode: "online" },
    { id: "fb-slot-3", date: dateISO, start_time: "18:00", end_time: "19:00", mode: "offline" },
  ];
}

export const FALLBACK_PUNDITS = [
  { id: "fb-p1", rating: "4.8", user: { full_name: "Pandit Sharma ji" } },
  { id: "fb-p2", rating: "4.9", user: { full_name: "Pandit Mishra ji" } },
  { id: "fb-p3", rating: "4.7", user: { full_name: "Pandit Tripathi ji" } },
];

/** Marketplace rows when API is empty — same shape as `GET /marketplace/products/`. */
export const FALLBACK_PRODUCTS = [
  {
    id: "fb-pr1",
    name: "Panchamrit Prasad",
    name_hindi: "पंचामृत प्रसाद",
    description: "Blessed prasad pack — pick up near main mandap.",
    price: "150",
    discounted_price: null,
    stock_quantity: 80,
    vendor: { id: "fb-vendor-1", shop_name: "Sacred Shop 1" },
  },
  {
    id: "fb-pr2",
    name: "Diya Set",
    name_hindi: "दीया सेट",
    description: "Brass diyas and cotton wicks for evening aarti.",
    price: "220",
    discounted_price: "199.00",
    stock_quantity: 40,
    vendor: { id: "fb-vendor-1", shop_name: "Sacred Shop 1" },
  },
  {
    id: "fb-pr3",
    name: "Incense Pack",
    name_hindi: "अगरबत्ती",
    description: "Fragrant agarbatti — assorted mild scents.",
    price: "80",
    discounted_price: null,
    stock_quantity: 200,
    vendor: { id: "fb-vendor-2", shop_name: "Sacred Shop 2" },
  },
  {
    id: "fb-pr4",
    name: "Ganga Jal",
    name_hindi: "गंगा जल",
    description: "Sealed bottle — for home altar use.",
    price: "120",
    discounted_price: null,
    stock_quantity: 60,
    vendor: { id: "fb-vendor-2", shop_name: "Sacred Shop 2" },
  },
  {
    id: "fb-pr5",
    name: "Rudraksha Mala",
    name_hindi: "रुद्राक्ष माला",
    description: "108-bead mala — energised at camp (demo listing).",
    price: "450",
    discounted_price: null,
    stock_quantity: 25,
    vendor: { id: "fb-vendor-1", shop_name: "Sacred Shop 1" },
  },
  {
    id: "fb-pr6",
    name: "Kumbh Souvenir Tee",
    name_hindi: "कुम्भ स्मारक टी-शर्ट",
    description: "Cotton tee with Prayagraj print — unisex sizes.",
    price: "399",
    discounted_price: "349.00",
    stock_quantity: 100,
    vendor: { id: "fb-vendor-2", shop_name: "Sacred Shop 2" },
  },
];

export function getFallbackProductById(productId: string): (typeof FALLBACK_PRODUCTS)[0] | undefined {
  return FALLBACK_PRODUCTS.find((p) => p.id === productId);
}

export function isDemoProductId(productId: string): boolean {
  return productId.startsWith("fb-pr");
}
