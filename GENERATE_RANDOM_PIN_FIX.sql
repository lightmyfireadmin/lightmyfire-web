-- Fix for generate_random_pin function with correct quote escaping

CREATE OR REPLACE FUNCTION public.generate_random_pin()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text[] := ARRAY['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  pin text := '';
  i integer;
BEGIN
  FOR i IN 1..3 LOOP
    pin := pin || chars[1 + floor(random() * 26)::int];
  END LOOP;
  pin := pin || '-';
  FOR i IN 1..3 LOOP
    pin := pin || chars[27 + floor(random() * 10)::int];
  END LOOP;
  RETURN pin;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_random_pin() TO authenticated, anon;
