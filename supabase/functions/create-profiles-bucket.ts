
// This is a Supabase Edge Function to create the profiles storage bucket
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create the profiles bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');

    if (!profilesBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket('profiles', {
          public: false,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
        });

      if (createError) {
        throw new Error(`Failed to create profiles bucket: ${createError.message}`);
      }

      // Set up RLS policies for the bucket
      await supabase.rpc('apply_profiles_bucket_policy');
    } else {
      console.log("Profiles bucket already exists");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: profilesBucketExists ? "Profiles bucket already exists" : "Created profiles bucket"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating profiles bucket:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
