
import { supabase } from "@/integrations/supabase/client";
import { UserSettings } from "@/types/database";

// Fetch user settings
export const fetchUserSettings = async (): Promise<UserSettings | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data as UserSettings;
};

// Update user settings
export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userData.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data as UserSettings;
};
