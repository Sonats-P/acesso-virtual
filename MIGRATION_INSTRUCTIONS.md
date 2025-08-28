# Instruções de Migração - Sistema de Controle de Acesso

## Novas Funcionalidades Implementadas

### ✅ Campos Adicionados
- **Tipo de Documento**: CPF, RG, CNH, Passaporte, Outro
- **Número do Documento**: Campo separado para o número do documento
- **Motivo da Visita**: Campo obrigatório para descrever o motivo da visita
- **Data da Visita**: Data automática do cadastro
- **Hora de Entrada**: Timestamp automático quando o visitante entra
- **Hora de Saída**: Timestamp automático quando o visitante sai

### ✅ Funcionalidades Automáticas
- **Entrada Automática**: Visitante entra automaticamente ao ser cadastrado
- **Timestamps Automáticos**: Horários de entrada/saída são registrados automaticamente
- **Busca Aprimorada**: Busca por nome, CPF, documento ou motivo da visita

## Como Aplicar a Migração

### 1. Execute a Migração no Supabase

```bash
# No terminal, dentro da pasta do projeto
supabase db push
```

Ou execute manualmente no SQL Editor do Supabase:

```sql
-- Execute o conteúdo do arquivo:
-- supabase/migrations/20250129000000_add_visit_fields.sql
```

### 2. Verifique se a Migração Foi Aplicada

Execute esta query no SQL Editor do Supabase para verificar:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'visitors' 
ORDER BY ordinal_position;
```

Você deve ver as novas colunas:
- `document_type`
- `document_number` 
- `visit_reason`
- `entry_time`
- `exit_time`
- `visit_date`

### 3. Teste as Novas Funcionalidades

1. **Cadastro de Visitante**:
   - Preencha todos os campos obrigatórios
   - Selecione o tipo de documento
   - Descreva o motivo da visita
   - Capture a foto

2. **Controle de Entrada/Saída**:
   - Use os botões de entrada/saída na lista
   - Verifique se os horários são registrados automaticamente

3. **Busca**:
   - Teste buscar por nome, CPF, documento ou motivo

## Estrutura da Nova Tabela

```sql
CREATE TABLE public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  document_type TEXT DEFAULT 'CPF',
  document_number TEXT,
  photo TEXT,
  status TEXT NOT NULL DEFAULT 'inside' CHECK (status IN ('inside', 'outside')),
  visit_reason TEXT,
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

## Funcionalidades Automáticas

### Triggers Implementados
- **set_visitor_entry_exit_times**: Define automaticamente os horários de entrada/saída
- **update_visitors_updated_at**: Atualiza o timestamp de modificação

### Comportamento
- Visitante entra automaticamente ao ser cadastrado
- Horário de entrada é registrado quando status muda para 'inside'
- Horário de saída é registrado quando status muda para 'outside'
- Data da visita é definida automaticamente no cadastro

## Interface Atualizada

### Formulário de Cadastro
- ✅ Nome completo (obrigatório)
- ✅ CPF (obrigatório, com validação)
- ✅ Tipo de documento (obrigatório)
- ✅ Número do documento (obrigatório)
- ✅ Motivo da visita (obrigatório)
- ✅ Foto (opcional)

### Lista de Visitantes
- ✅ Nome e documento
- ✅ Motivo da visita
- ✅ Data da visita
- ✅ Horários de entrada/saída
- ✅ Status visual
- ✅ Busca aprimorada

## Próximos Passos

1. Execute a migração
2. Teste todas as funcionalidades
3. Treine os usuários nas novas funcionalidades
4. Configure backups regulares dos dados

## Suporte

Se encontrar algum problema durante a migração, verifique:
1. Se o Supabase está funcionando
2. Se as permissões estão corretas
3. Se não há conflitos de dados existentes
