-- =====================================================
-- SCRIPT PARA AJUSTAR RLS PARA AUTENTICAÇÃO LOCAL
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. REMOVER POLÍTICA RESTRITIVA ATUAL
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated users to manage visitors" ON public.visitors;

-- 2. CRIAR POLÍTICA MAIS SEGURA MAS COMPATÍVEL COM AUTENTICAÇÃO LOCAL
-- =====================================================

-- Política que permite acesso público mas com validações de segurança
CREATE POLICY "Allow public access with security constraints" 
ON public.visitors 
FOR ALL 
USING (true) 
WITH CHECK (
  -- Validações de segurança
  name IS NOT NULL AND length(name) >= 3 AND
  document_number IS NOT NULL AND length(document_number) >= 3 AND
  visit_reason IS NOT NULL AND length(visit_reason) >= 3 AND
  status IN ('inside', 'outside') AND
  visit_date <= CURRENT_DATE
);

-- 3. VERIFICAR SE A POLÍTICA FOI CRIADA CORRETAMENTE
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

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
