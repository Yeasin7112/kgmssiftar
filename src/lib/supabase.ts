import { supabase } from "@/integrations/supabase/client";

export { supabase };

export interface JoiningRequest {
  id: string;
  name: string;
  ssc_batch: number;
  photo_url?: string;
  payment_amount: number;
  payment_method: string;
  payment_number?: string;
  transaction_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
