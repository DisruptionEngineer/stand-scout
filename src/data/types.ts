export const Category = {
  Produce: 'Produce',
  Eggs: 'Eggs',
  Honey: 'Honey',
  BakedGoods: 'Baked Goods',
  Dairy: 'Dairy',
  Meat: 'Meat',
  Flowers: 'Flowers',
  Crafts: 'Crafts',
  Firewood: 'Firewood',
  Seasonal: 'Seasonal',
  Preserves: 'Preserves',
  Other: 'Other',
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export type StandModerationStatus = 'pending' | 'approved' | 'rejected';
export type AvailabilityStatus = 'available' | 'sold_out' | 'unknown';
export type StatusSource = 'owner_sms' | 'community_qr' | 'community_app' | null;
export type ReportSource = 'qr_scan' | 'app_report';
export type ReportStatus = 'stocked' | 'empty';

export interface Stand {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  categories: Category[];
  products: string[];
  currentlyAvailable: string[];
  availabilityStatus: AvailabilityStatus;
  lastStatusUpdate: string | null;
  lastStatusSource: StatusSource;
  typicalAvailability: string;
  phone: string;
  website?: string;
  smsLinked: boolean;
  photos: string[];
  ownerName: string;
  dateAdded: string;
  seasonal: boolean;
  seasonalNotes?: string;
  rating: number;
  reviewCount: number;
  paymentMethods: string[];
  selfServe: boolean;
  status?: StandModerationStatus;
}

export interface AvailabilityReport {
  id: string;
  standId: string;
  status: ReportStatus;
  productsSpotted: string[];
  photoUrl?: string;
  timestamp: string;
  source: ReportSource;
}

export interface Review {
  id: string;
  standId: string;
  rating: number;
  text: string;
  authorName: string;
  date: string;
}

export interface SMSEvent {
  id: string;
  standId: string;
  phoneNumber: string;
  rawMessage: string;
  parsedAction: string;
  parsedProducts: string[];
  timestamp: string;
}

export interface ProductReport {
  id: string;
  standId: string;
  productName: string;
  isAvailable: boolean;
  source: ReportSource;
  reportWeight: number;
  createdAt: string;
}
