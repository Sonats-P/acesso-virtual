-- =====================================================
-- CORREÇÃO DE EMERGÊNCIA - ERRO DE CADASTRO
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================

ALTER TABLE public.visitors DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE RLS FOI DESABILITADO
-- =====================================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'visitors';

-- 3. TESTAR INSERÇÃO DIRETA
-- =====================================================

-- Teste de inserção para verificar se funciona
INSERT INTO public.visitors (
  name, 
  document_type, 
  document_number, 
  visit_reason, 
  status, 
  visit_date
) VALUES (
  'Teste de Cadastro', 
  'CPF', 
  '12345678901', 
  'Teste de funcionamento', 
  'inside', 
  CURRENT_DATE
);

-- 4. VERIFICAR SE O REGISTRO FOI INSERIDO
-- =====================================================

SELECT * FROM public.visitors WHERE name = 'Teste de Cadastro';

-- 5. REMOVER O REGISTRO DE TESTE
-- =====================================================

DELETE FROM public.visitors WHERE name = 'Teste de Cadastro';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
