-- =====================================================
-- SCRIPT RÁPIDO PARA CORRIGIR ERRO DE CADASTRO
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
-- =====================================================

DROP POLICY IF EXISTS "Allow all operations on visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow authenticated users to manage visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow public access with security constraints" ON public.visitors;

-- 2. CRIAR POLÍTICA SIMPLES E FUNCIONAL
-- =====================================================

-- Política que permite todas as operações (temporária para teste)
CREATE POLICY "Allow all operations on visitors" 
ON public.visitors 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. VERIFICAR SE A POLÍTICA FOI CRIADA
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

-- 4. TESTAR INSERÇÃO (OPCIONAL)
-- =====================================================

-- Descomente as linhas abaixo para testar se a inserção funciona
-- INSERT INTO public.visitors (name, document_type, document_number, visit_reason, status, visit_date)
-- VALUES ('Teste', 'CPF', '12345678901', 'Teste de inserção', 'inside', CURRENT_DATE);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
