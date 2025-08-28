-- =====================================================
-- CORREÇÃO DO TRIGGER DE AUDITORIA
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. REMOVER TRIGGER E FUNÇÃO DE AUDITORIA PROBLEMÁTICOS
-- =====================================================

DROP TRIGGER IF EXISTS audit_visitor_changes_trigger ON public.visitors;
DROP FUNCTION IF EXISTS public.audit_visitor_changes();

-- 2. CRIAR FUNÇÃO DE AUDITORIA CORRIGIDA
-- =====================================================

CREATE OR REPLACE FUNCTION public.audit_visitor_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.visitor_audit_log (visitor_id, action, new_values, user_id)
    VALUES (NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.visitor_audit_log (visitor_id, action, old_values, new_values, user_id)
    VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Para DELETE, não inserir na auditoria para evitar problemas de foreign key
    -- ou usar CASCADE DELETE na tabela de auditoria
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. RECRIAR TRIGGER DE AUDITORIA
-- =====================================================

CREATE TRIGGER audit_visitor_changes_trigger
AFTER INSERT OR UPDATE ON public.visitors
FOR EACH ROW EXECUTE FUNCTION public.audit_visitor_changes();

-- 4. ALTERNATIVA: CRIAR TRIGGER SEPARADO PARA DELETE
-- =====================================================

CREATE OR REPLACE FUNCTION public.audit_visitor_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na auditoria antes de deletar
  INSERT INTO public.visitor_audit_log (visitor_id, action, old_values, user_id)
  VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_visitor_delete_trigger
BEFORE DELETE ON public.visitors
FOR EACH ROW EXECUTE FUNCTION public.audit_visitor_delete();

-- 5. VERIFICAR SE OS TRIGGERS FORAM CRIADOS
-- =====================================================

SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing, 
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'visitors';

-- 6. TESTAR INSERÇÃO E ATUALIZAÇÃO
-- =====================================================

-- Teste de inserção
INSERT INTO public.visitors (
  name, 
  document_type, 
  document_number, 
  visit_reason, 
  status, 
  visit_date,
  cpf
) VALUES (
  'Teste Auditoria', 
  'CPF', 
  '11122233344', 
  'Teste de auditoria', 
  'inside', 
  CURRENT_DATE,
  '11122233344'
);

-- Verificar se foi inserido na auditoria
SELECT * FROM public.visitor_audit_log WHERE action = 'INSERT' ORDER BY created_at DESC LIMIT 1;

-- 7. LIMPAR DADOS DE TESTE
-- =====================================================

DELETE FROM public.visitors WHERE name = 'Teste Auditoria';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
