
import { supabase } from "@/integrations/supabase/client";
import { SecurityTip as DBSecurityTip } from "@/types/database";
import { toast } from "sonner";

// Export the SecurityTip type
export type SecurityTip = DBSecurityTip;

// Fetch security tips
export const fetchSecurityTips = async (
  limit: number = 5,
  category?: string
): Promise<SecurityTip[]> => {
  let query = supabase
    .from('security_tips')
    .select('*')
    .order('priority', { ascending: true })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching security tips:', error);
    return [];
  }

  return data as SecurityTip[];
};

// Fetch a random security tip
export const fetchSecurityTip = async (): Promise<SecurityTip | null> => {
  const { data, error } = await supabase
    .from('security_tips')
    .select('*');

  if (error) {
    console.error('Error fetching security tips:', error);
    return null;
  }

  if (data.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex] as SecurityTip;
};

// Show a security tip notification
export const showSecurityTipNotification = async (): Promise<void> => {
  try {
    const tip = await fetchSecurityTip();
    
    if (tip) {
      toast.info(tip.title, {
        description: tip.content,
        duration: 8000,
      });
    }
  } catch (error) {
    console.error('Error showing security tip notification:', error);
  }
};
