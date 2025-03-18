
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string | null;
}

// Fetch the current user's profile
export const fetchProfile = async (): Promise<Profile | null> => {
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

// For backward compatibility, alias getProfile to fetchProfile
export const getProfile = fetchProfile;

// Update the current user's profile
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
    
    toast.success('Profile updated successfully');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Upload profile avatar
export const uploadAvatar = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${userData.user.id}.${fileExt}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true });
      
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
      
    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userData.user.id);
      
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get user profile summary (for display in header, etc.)
export const getProfileSummary = async (): Promise<string> => {
  const profile = await fetchProfile();
  
  if (!profile) return 'Guest User';
  
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  if (profile.first_name) return profile.first_name;
  
  const { data } = await supabase.auth.getUser();
  return data.user?.email?.split('@')[0] || 'User';
};

// Generate demo data for the user on first login
export const generateInitialDemoData = async (): Promise<void> => {
  const { generateDemoData } = await import('@/utils/demoDataGenerator');
  
  try {
    const result = await generateDemoData();
    
    if (result) {
      console.log('Demo data generated successfully');
    }
  } catch (error) {
    console.error('Error generating demo data:', error);
  }
};
