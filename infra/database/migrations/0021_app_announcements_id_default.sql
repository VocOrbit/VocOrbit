ALTER TABLE app_announcements
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

DO $$
BEGIN
  IF to_regclass('public.directus_fields') IS NULL THEN
    RETURN;
  END IF;

  UPDATE directus_fields
  SET readonly = false
  WHERE collection = 'app_announcements'
    AND field IN ('starts_at', 'ends_at');

  UPDATE directus_fields
  SET hidden = true
  WHERE collection = 'app_announcements'
    AND field = 'id';
END $$;
