export type VisitorStatus = 'inside' | 'outside';
export type DocumentType = 'CPF' | 'RG' | 'CNH' | 'Passaporte' | 'Outro';

export interface Visitor {
  id: string;
  name: string;
  cpf?: string;
  document_type: DocumentType;
  document_number: string;
  photo?: string;
  status: VisitorStatus;
  visit_reason?: string;
  entry_time?: string;
  exit_time?: string;
  visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVisitorData {
  name: string;
  cpf?: string;
  document_type?: DocumentType;
  document_number?: string;
  photo?: string;
  visit_reason?: string;
  status?: VisitorStatus;
}