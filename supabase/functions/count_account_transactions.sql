
-- Function to count transactions for an account within a time period
CREATE OR REPLACE FUNCTION public.count_account_transactions(
  p_account_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_end_time IS NULL THEN
    p_end_time := NOW();
  END IF;

  SELECT COUNT(*)
  INTO v_count
  FROM public.transactions
  WHERE account_id = p_account_id
    AND created_at BETWEEN p_start_time AND p_end_time;
    
  RETURN v_count;
END;
$$;
