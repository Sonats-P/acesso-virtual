-- =====================================================
-- SCRIPT PARA CORRIGIR SEGURANÇA E CRIAR LOGIN
-- Execute este script no Editor SQL do Supabase
-- =====================================================

-- 1. CORRIGIR POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Remover política permissiva atual
DROP POLICY IF EXISTS "Allow all operations on visitors" ON public.visitors;

-- Criar política mais restritiva para usuários autenticados
CREATE POLICY "Allow authenticated users to manage visitors" 
ON public.visitors 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 2. CORRIGIR FUNÇÕES COM SEARCH_PATH
-- =====================================================

-- Corrigir função de atualização de timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Corrigir função de entrada/saída
CREATE OR REPLACE FUNCTION public.set_entry_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status está mudando para 'inside' e entry_time é null, definir
  IF NEW.status = 'inside' AND OLD.status != 'inside' AND NEW.entry_time IS NULL THEN
    NEW.entry_time = now();
  END IF;
  
  -- Se status está mudando para 'outside' e exit_time é null, definir
  IF NEW.status = 'outside' AND OLD.status != 'outside' AND NEW.exit_time IS NULL THEN
    NEW.exit_time = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. CRIAR USUÁRIO DE LOGIN PARA PORTARIA
-- =====================================================

-- Inserir usuário na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'p.sonats@gmail.com',
  crypt('123@Portaria', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "Portaria"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 4. ADICIONAR CONSTRAINTS DE SEGURANÇA
-- =====================================================

-- Garantir que document_number não seja null quando document_type é fornecido
ALTER TABLE public.visitors 
ADD CONSTRAINT check_document_number_not_null 
CHECK (
  (document_type IS NULL AND document_number IS NULL) OR 
  (document_type IS NOT NULL AND document_number IS NOT NULL)
);

-- Garantir que visit_date não seja no futuro
ALTER TABLE public.visitors 
ADD CONSTRAINT check_visit_date_not_future 
CHECK (visit_date <= CURRENT_DATE);

-- 5. CRIAR TABELA DE AUDITORIA
-- =====================================================

-- Criar tabela de log de auditoria
CREATE TABLE IF NOT EXISTS public.visitor_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.visitor_audit_log ENABLE ROW LEVEL SECURITY;

-- Política para tabela de auditoria - apenas usuários autenticados podem ler
CREATE POLICY "Allow authenticated users to read audit log" 
ON public.visitor_audit_log 
FOR SELECT 
TO authenticated
USING (true);

-- 6. CRIAR FUNÇÃO E TRIGGER DE AUDITORIA
-- =====================================================

-- Função de auditoria
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
    INSERT INTO public.visitor_audit_log (visitor_id, action, old_values, user_id)
    VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger de auditoria
CREATE TRIGGER audit_visitor_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.visitors
FOR EACH ROW EXECUTE FUNCTION public.audit_visitor_changes();

-- 7. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- =====================================================

-- Verificar se o usuário foi criado
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'username' as username,
  created_at 
FROM auth.users 
WHERE email = 'p.sonats@gmail.com';

-- Verificar políticas RLS
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

-- Verificar se as funções foram criadas corretamente
SELECT 
  proname as function_name,
  prokind as function_type,
  prosecdef as security_definer
FROM pg_proc 
WHERE proname IN ('update_updated_at_column', 'set_entry_time', 'audit_visitor_changes');

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
