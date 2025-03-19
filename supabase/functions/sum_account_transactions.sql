
-- Function to sum transaction amounts for an account within a time period
CREATE OR REPLACE FUNCTION public.sum_account_transactions(
  p_account_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sum DECIMAL;
BEGIN
  IF p_end_time IS NULL THEN
    p_end_time := NOW();
  END IF;

  SELECT COALESCE(SUM(ABS(amount)), 0)
  INTO v_sum
  FROM public.transactions
  WHERE account_id = p_account_id
    AND created_at BETWEEN p_start_time AND p_end_time;
    
  RETURN v_sum;
END;
$$;
