
-- Function to create demo data for testing the fraud detection system
CREATE OR REPLACE FUNCTION public.create_demo_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_account_id UUID;
  v_amount DECIMAL;
  v_transaction_type TEXT;
  v_risk_score INTEGER;
BEGIN
  -- Create a demo user (if doesn't exist)
  INSERT INTO auth.users (id, email)
  VALUES (
    gen_random_uuid(),
    'demo@securasentry.com'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  -- If user already existed, get the ID
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'demo@securasentry.com';
  END IF;
  
  -- Create a demo account
  INSERT INTO public.accounts (
    user_id, 
    account_number, 
    balance, 
    account_type
  )
  VALUES (
    v_user_id,
    'DEMO-' || LEFT(md5(random()::text), 8),
    10000.00,
    'checking'
  )
  RETURNING id INTO v_account_id;
  
  -- Create 10 normal transactions
  FOR i IN 1..10 LOOP
    -- Random amount between $10 and $500
    v_amount := (random() * 490 + 10)::DECIMAL(12,2);
    
    -- Random transaction type
    CASE floor(random() * 5)::INT
      WHEN 0 THEN v_transaction_type := 'deposit';
      WHEN 1 THEN v_transaction_type := 'withdrawal';
      WHEN 2 THEN v_transaction_type := 'transfer';
      WHEN 3 THEN v_transaction_type := 'payment';
      ELSE v_transaction_type := 'refund';
    END CASE;
    
    -- Normal risk score between 10 and 40
    v_risk_score := floor(random() * 30 + 10)::INT;
    
    -- Insert normal transaction
    INSERT INTO public.transactions (
      account_id,
      amount,
      transaction_type,
      status,
      risk_score,
      merchant,
      created_at,
      metadata
    )
    VALUES (
      v_account_id,
      CASE WHEN v_transaction_type IN ('withdrawal', 'payment', 'transfer') THEN -v_amount ELSE v_amount END,
      v_transaction_type,
      'completed',
      v_risk_score,
      'Demo Merchant ' || i,
      NOW() - (random() * INTERVAL '5 days'),
      jsonb_build_object('demo', true, 'note', 'Normal transaction')
    );
  END LOOP;
  
  -- Create 3 suspicious transactions
  FOR i IN 1..3 LOOP
    -- Higher amount for suspicious transactions between $800 and $3000
    v_amount := (random() * 2200 + 800)::DECIMAL(12,2);
    
    -- Biased towards riskier transaction types
    CASE floor(random() * 3)::INT
      WHEN 0 THEN v_transaction_type := 'withdrawal';
      WHEN 1 THEN v_transaction_type := 'transfer';
      ELSE v_transaction_type := 'payment';
    END CASE;
    
    -- Higher risk score between 60 and 90
    v_risk_score := floor(random() * 30 + 60)::INT;
    
    -- Insert suspicious transaction
    INSERT INTO public.transactions (
      account_id,
      amount,
      transaction_type,
      status,
      risk_score,
      merchant,
      created_at,
      metadata,
      ip_address,
      location_data
    )
    VALUES (
      v_account_id,
      CASE WHEN v_transaction_type IN ('withdrawal', 'payment', 'transfer') THEN -v_amount ELSE v_amount END,
      v_transaction_type,
      CASE WHEN v_risk_score >= 70 THEN 'flagged' ELSE 'completed' END,
      v_risk_score,
      'Suspicious Merchant ' || i,
      NOW() - (random() * INTERVAL '3 days'),
      jsonb_build_object('demo', true, 'note', 'Suspicious transaction'),
      '185.156.' || floor(random() * 255)::text || '.' || floor(random() * 255)::text,
      jsonb_build_object('country', 'RU', 'city', 'Moscow')
    );
    
    -- Create fraud alert for high-risk transactions
    IF v_risk_score >= 70 THEN
      INSERT INTO public.fraud_alerts (
        transaction_id,
        detection_method,
        severity,
        status,
        details
      )
      VALUES (
        currval('transactions_id_seq'),
        'automated_risk_scoring',
        CASE 
          WHEN v_risk_score >= 90 THEN 'critical'
          WHEN v_risk_score >= 80 THEN 'high'
          ELSE 'medium'
        END,
        'new',
        jsonb_build_object(
          'risk_score', v_risk_score,
          'transaction_amount', v_amount,
          'transaction_type', v_transaction_type,
          'detection_timestamp', NOW(),
          'demo', true
        )
      );
    END IF;
  END LOOP;
  
  -- Create 1 critical transaction (for demonstration)
  INSERT INTO public.transactions (
    account_id,
    amount,
    transaction_type,
    status,
    risk_score,
    merchant,
    created_at,
    metadata,
    ip_address,
    location_data,
    device_info
  )
  VALUES (
    v_account_id,
    -8500.00,
    'transfer',
    'flagged',
    95,
    'UNKNOWN-OFFSHORE-SERVICE',
    NOW() - INTERVAL '4 hours',
    jsonb_build_object('demo', true, 'note', 'Critical transaction'),
    '185.156.73.42',
    jsonb_build_object('country', 'VE', 'city', 'Caracas'),
    jsonb_build_object('isEmulator', true, 'browser', 'Unknown Browser', 'os', 'Modified Android')
  );
  
  -- Create fraud alert for the critical transaction
  INSERT INTO public.fraud_alerts (
    transaction_id,
    detection_method,
    severity,
    status,
    details
  )
  VALUES (
    currval('transactions_id_seq'),
    'automated_risk_scoring',
    'critical',
    'new',
    jsonb_build_object(
      'risk_score', 95,
      'transaction_amount', 8500.00,
      'transaction_type', 'transfer',
      'detection_timestamp', NOW(),
      'demo', true,
      'risk_factors', jsonb_build_array(
        jsonb_build_object('type', 'high_amount', 'score', 30),
        jsonb_build_object('type', 'high_risk_location', 'score', 40),
        jsonb_build_object('type', 'emulator_detected', 'score', 25)
      )
    )
  );
END;
$$;
