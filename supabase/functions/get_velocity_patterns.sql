
-- Function to detect velocity patterns (rapid succession of transactions)
CREATE OR REPLACE FUNCTION public.get_velocity_patterns(
  p_timeframe TIMESTAMP WITH TIME ZONE,
  p_min_transactions INTEGER
)
RETURNS TABLE(
  account_id UUID,
  user_id UUID,
  transaction_ids UUID[],
  transaction_count INTEGER,
  total_amount DECIMAL,
  time_span_minutes INTEGER,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH recent_transactions AS (
    SELECT 
      t.id,
      t.account_id,
      a.user_id,
      t.amount,
      t.created_at
    FROM public.transactions t
    JOIN public.accounts a ON t.account_id = a.id
    WHERE 
      t.created_at >= p_timeframe
      AND t.status = 'completed'
  ),
  account_stats AS (
    SELECT
      account_id,
      user_id,
      ARRAY_AGG(id) AS transaction_ids,
      COUNT(*) AS transaction_count,
      SUM(ABS(amount)) AS total_amount,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 AS time_span_minutes
    FROM recent_transactions
    GROUP BY account_id, user_id
    HAVING COUNT(*) >= p_min_transactions
  )
  SELECT
    account_id,
    user_id,
    transaction_ids,
    transaction_count,
    total_amount,
    time_span_minutes::INTEGER,
    'High velocity of transactions in a short time period' AS description
  FROM account_stats
  WHERE time_span_minutes <= 30;  -- Transactions within 30 minutes
END;
$$;
