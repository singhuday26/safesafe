
-- Function to update account balance based on transaction
CREATE OR REPLACE FUNCTION public.update_account_balance(
  p_account_id UUID,
  p_amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.accounts
  SET 
    balance = balance + p_amount,
    updated_at = NOW()
  WHERE id = p_account_id;
END;
$$;
