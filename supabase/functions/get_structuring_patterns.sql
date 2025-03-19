
-- Function to detect structuring patterns (multiple small transactions)
CREATE OR REPLACE FUNCTION public.get_structuring_patterns(
  p_timeframe TIMESTAMP WITH TIME ZONE,
  p_min_transactions INTEGER,
  p_max_amount DECIMAL
)
RETURNS TABLE(
  account_id UUID,
  user_id UUID,
  transaction_ids UUID[],
  transaction_count INTEGER,
  total_amount DECIMAL,
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
      AND t.amount <= p_max_amount
      AND t.status = 'completed'
  ),
  account_stats AS (
    SELECT
      account_id,
      user_id,
      ARRAY_AGG(id) AS transaction_ids,
      COUNT(*) AS transaction_count,
      SUM(ABS(amount)) AS total_amount
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
    'Multiple small transactions detected in a short time period, possible structuring' AS description
  FROM account_stats;
END;
$$;
