export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      stands: {
        Row: {
          id: string;
          name: string;
          description: string;
          latitude: number;
          longitude: number;
          address: string;
          categories: string[];
          products: string[];
          currently_available: string[];
          availability_status: 'available' | 'sold_out' | 'unknown';
          last_status_update: string | null;
          last_status_source: 'owner_sms' | 'community_qr' | 'community_app' | null;
          typical_availability: string;
          phone: string;
          website: string | null;
          sms_linked: boolean;
          photos: string[];
          owner_name: string;
          date_added: string;
          seasonal: boolean;
          seasonal_notes: string | null;
          rating: number;
          review_count: number;
          payment_methods: string[];
          self_serve: boolean;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          latitude: number;
          longitude: number;
          address: string;
          categories?: string[];
          products?: string[];
          currently_available?: string[];
          availability_status?: 'available' | 'sold_out' | 'unknown';
          last_status_update?: string | null;
          last_status_source?: 'owner_sms' | 'community_qr' | 'community_app' | null;
          typical_availability?: string;
          phone: string;
          website?: string | null;
          sms_linked?: boolean;
          photos?: string[];
          owner_name: string;
          date_added?: string;
          seasonal?: boolean;
          seasonal_notes?: string | null;
          rating?: number;
          review_count?: number;
          payment_methods?: string[];
          self_serve?: boolean;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: Partial<Database['public']['Tables']['stands']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          stand_id: string;
          rating: number;
          text: string;
          author_name: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stand_id: string;
          rating: number;
          text: string;
          author_name: string;
          date?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      availability_reports: {
        Row: {
          id: string;
          stand_id: string;
          status: 'stocked' | 'empty';
          products_spotted: string[];
          photo_url: string | null;
          timestamp: string;
          source: 'qr_scan' | 'app_report';
        };
        Insert: {
          id?: string;
          stand_id: string;
          status: 'stocked' | 'empty';
          products_spotted?: string[];
          photo_url?: string | null;
          source?: 'qr_scan' | 'app_report';
        };
        Update: Partial<Database['public']['Tables']['availability_reports']['Insert']>;
      };
    };
  };
};

export type StandRow = Database['public']['Tables']['stands']['Row'];
export type StandInsert = Database['public']['Tables']['stands']['Insert'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReportInsert = Database['public']['Tables']['availability_reports']['Insert'];
