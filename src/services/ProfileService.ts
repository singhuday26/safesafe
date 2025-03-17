
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string | null;
}

export const getProfile = async (): Promise<Profile | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
};

export const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userData.user.id);
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
