-- =====================================================
-- CORREÇÃO DO CONSTRAINT CPF
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. VERIFICAR O ESTADO ATUAL DA COLUNA CPF
-- =====================================================

SELECT 
  column_name, 
  is_nullable, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'visitors' AND column_name = 'cpf';

-- 2. REMOVER CONSTRAINT NOT NULL DA COLUNA CPF
-- =====================================================

ALTER TABLE public.visitors ALTER COLUMN cpf DROP NOT NULL;

-- 3. VERIFICAR SE A MUDANÇA FOI APLICADA
-- =====================================================

SELECT 
  column_name, 
  is_nullable, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'visitors' AND column_name = 'cpf';

-- 4. TESTAR INSERÇÃO COM CPF NULL
-- =====================================================

-- Teste de inserção para verificar se funciona com cpf null
INSERT INTO public.visitors (
  name, 
  document_type, 
  document_number, 
  visit_reason, 
  status, 
  visit_date,
  cpf
) VALUES (
  'Teste CPF Null', 
  'CPF', 
  '12345678901', 
  'Teste com CPF null', 
  'inside', 
  CURRENT_DATE,
  NULL
);

-- 5. VERIFICAR SE O REGISTRO FOI INSERIDO
-- =====================================================

SELECT * FROM public.visitors WHERE name = 'Teste CPF Null';

-- 6. REMOVER O REGISTRO DE TESTE
-- =====================================================

DELETE FROM public.visitors WHERE name = 'Teste CPF Null';

-- 7. TESTAR INSERÇÃO COM CPF PREENCHIDO
-- =====================================================

-- Teste de inserção para verificar se funciona com cpf preenchido
INSERT INTO public.visitors (
  name, 
  document_type, 
  document_number, 
  visit_reason, 
  status, 
  visit_date,
  cpf
) VALUES (
  'Teste CPF Preenchido', 
  'CPF', 
  '98765432100', 
  'Teste com CPF preenchido', 
  'inside', 
  CURRENT_DATE,
  '98765432100'
);

-- 8. VERIFICAR SE O REGISTRO FOI INSERIDO
-- =====================================================

SELECT * FROM public.visitors WHERE name = 'Teste CPF Preenchido';

-- 9. REMOVER O REGISTRO DE TESTE
-- =====================================================

DELETE FROM public.visitors WHERE name = 'Teste CPF Preenchido';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
