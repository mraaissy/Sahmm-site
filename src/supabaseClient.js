import { createClient } from "@supabase/supabase-js";

// Clé "anon / public" — sans risque à exposer côté client, c'est prévu pour ça.
// Toute la sécurité réelle est assurée par les règles RLS côté base de données.
const supabaseUrl = "https://ctuskzfupoufgysuojrt.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dXNremZ1cG91Zmd5c3VvanJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzQxMjcsImV4cCI6MjEwMTE1MDEyN30.sV2KNNDQUv01CrZHL8EwG_SUSadnLCtTW7bItfnSnKg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
