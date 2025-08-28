-- =====================================================
-- CORREÇÃO FINAL - REMOVER TODAS AS RESTRIÇÕES
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. DESABILITAR RLS COMPLETAMENTE
-- =====================================================

ALTER TABLE public.visitors DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations on visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow authenticated users to manage visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow public access with security constraints" ON public.visitors;

-- 3. REMOVER TODOS OS TRIGGERS DE AUDITORIA
-- =====================================================

DROP TRIGGER IF EXISTS audit_visitor_changes_trigger ON public.visitors;
DROP TRIGGER IF EXISTS audit_visitor_delete_trigger ON public.visitors;
DROP FUNCTION IF EXISTS public.audit_visitor_changes();
DROP FUNCTION IF EXISTS public.audit_visitor_delete();

-- 4. REMOVER TABELA DE AUDITORIA (OPCIONAL)
-- =====================================================

DROP TABLE IF EXISTS public.visitor_audit_log;

-- 5. GARANTIR QUE CPF PODE SER NULL
-- =====================================================

ALTER TABLE public.visitors ALTER COLUMN cpf DROP NOT NULL;

-- 6. VERIFICAR ESTRUTURA FINAL
-- =====================================================

SELECT 
  column_name, 
  is_nullable, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'visitors' 
ORDER BY ordinal_position;

-- 7. TESTE FINAL DE INSERÇÃO
-- =====================================================

INSERT INTO public.visitors (
  name, 
  document_type, 
  document_number, 
  visit_reason, 
  status, 
  visit_date,
  cpf
) VALUES (
  'Teste Final', 
  'CPF', 
  '12345678901', 
  'Teste final', 
  'inside', 
  CURRENT_DATE,
  NULL
);

-- 8. VERIFICAR SE FOI INSERIDO
-- =====================================================

SELECT * FROM public.visitors WHERE name = 'Teste Final';

-- 9. LIMPAR TESTE
-- =====================================================

DELETE FROM public.visitors WHERE name = 'Teste Final';

-- =====================================================
-- FIM DA CORREÇÃO FINAL
-- =====================================================
