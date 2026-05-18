
-- Fix search_path on remaining function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Restrict storage SELECT to owner only (files are still publicly readable by URL since bucket is public)
DROP POLICY IF EXISTS "Reference images public read" ON storage.objects;
CREATE POLICY "Users list own refs" ON storage.objects FOR SELECT
  USING (bucket_id = 'character-references' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Restrict execute on SECURITY DEFINER helpers — keep authenticated for RLS use
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
