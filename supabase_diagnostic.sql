-- =====================================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA VISITORS
-- =====================================================

SELECT 
  column_name, 
  is_nullable, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'visitors' 
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINTS DA TABELA
-- =====================================================

SELECT 
  tc.constraint_name, 
  tc.constraint_type, 
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'visitors';

-- 3. VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'visitors';

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'visitors';

-- 5. TESTE SIMPLES DE INSERÇÃO
-- =====================================================

-- Teste com dados mínimos
INSERT INTO public.visitors (
  name, 
  document_type, 
  document_number, 
  visit_reason, 
  status, 
  visit_date
) VALUES (
  'Teste Simples', 
  'CPF', 
  '12345678901', 
  'Teste', 
  'inside', 
  CURRENT_DATE
);

-- 6. VERIFICAR SE FOI INSERIDO
-- =====================================================

SELECT * FROM public.visitors WHERE name = 'Teste Simples';

-- 7. LIMPAR TESTE
-- =====================================================

DELETE FROM public.visitors WHERE name = 'Teste Simples';

-- =====================================================
-- FIM DO DIAGNÓSTICO
-- =====================================================
