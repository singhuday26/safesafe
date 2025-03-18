
-- This SQL file will be executed to create a storage bucket for profile images
-- You'll need to run this in the Supabase SQL Editor

CREATE POLICY "Public profiles are viewable by everyone." ON storage.objects 
FOR SELECT USING (
  bucket_id = 'profiles' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can upload their own profile." ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.uid() = SUBSTRING(name, 9, POSITION('.' IN SUBSTRING(name, 9)) - 1)::uuid
);

CREATE POLICY "Users can update their own profile." ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'profiles' AND 
  auth.uid() = SUBSTRING(name, 9, POSITION('.' IN SUBSTRING(name, 9)) - 1)::uuid
);
