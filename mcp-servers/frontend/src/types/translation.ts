export interface Translation {
  id: string;
  user: string;
  original_text: string;
  translated_text: string;
  target_language: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  review_notes?: string;
}
