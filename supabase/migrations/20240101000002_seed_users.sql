-- ============================================================
-- Seed fixed users for MERA Solutions HR Onboarding App
-- Uses deterministic UUIDs so migration is idempotent
-- ============================================================

DO $$
DECLARE
  admin_id   UUID := '00000000-0000-0000-0000-000000000001';
  rrhh_id    UUID := '00000000-0000-0000-0000-000000000002';
  ops_id     UUID := '00000000-0000-0000-0000-000000000003';
  calidad_id UUID := '00000000-0000-0000-0000-000000000004';
  cap_id     UUID := '00000000-0000-0000-0000-000000000005';
BEGIN
  -- Clean up existing seed users (idempotent)
  DELETE FROM auth.identities
    WHERE user_id IN (admin_id, rrhh_id, ops_id, calidad_id, cap_id);
  DELETE FROM auth.users
    WHERE id IN (admin_id, rrhh_id, ops_id, calidad_id, cap_id);

  -- ── Insert into auth.users ──────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    admin_id, 'authenticated', 'authenticated',
    'admin@mera.com',
    crypt('Admin2025!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"admin","name":"Administrador"}'::jsonb,
    FALSE, NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    rrhh_id, 'authenticated', 'authenticated',
    'rrhh@mera.com',
    crypt('RRHH2025!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"rrhh","name":"Recursos Humanos"}'::jsonb,
    FALSE, NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    ops_id, 'authenticated', 'authenticated',
    'operaciones@mera.com',
    crypt('Ops2025!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"operaciones","name":"Operaciones"}'::jsonb,
    FALSE, NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    calidad_id, 'authenticated', 'authenticated',
    'calidad@mera.com',
    crypt('Calidad2025!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"calidad","name":"Calidad"}'::jsonb,
    FALSE, NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    cap_id, 'authenticated', 'authenticated',
    'capacitacion@mera.com',
    crypt('Cap2025!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"capacitacion","name":"Capacitación"}'::jsonb,
    FALSE, NOW(), NOW(), '', '', '', ''
  );

  -- ── Insert auth.identities (email provider) ──────────────────
  INSERT INTO auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES
  (
    'admin@mera.com', admin_id,
    json_build_object(
      'sub', admin_id::text,
      'email', 'admin@mera.com',
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email', NOW(), NOW(), NOW()
  ),
  (
    'rrhh@mera.com', rrhh_id,
    json_build_object(
      'sub', rrhh_id::text,
      'email', 'rrhh@mera.com',
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email', NOW(), NOW(), NOW()
  ),
  (
    'operaciones@mera.com', ops_id,
    json_build_object(
      'sub', ops_id::text,
      'email', 'operaciones@mera.com',
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email', NOW(), NOW(), NOW()
  ),
  (
    'calidad@mera.com', calidad_id,
    json_build_object(
      'sub', calidad_id::text,
      'email', 'calidad@mera.com',
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email', NOW(), NOW(), NOW()
  ),
  (
    'capacitacion@mera.com', cap_id,
    json_build_object(
      'sub', cap_id::text,
      'email', 'capacitacion@mera.com',
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email', NOW(), NOW(), NOW()
  );

  RAISE NOTICE 'Seed users created successfully.';
END $$;
