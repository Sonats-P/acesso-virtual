export type VisitorStatus = 'inside' | 'outside';

export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  photo?: string;
  status: VisitorStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateVisitorData {
  name: string;
  cpf: string;
  photo?: string;
  status?: VisitorStatus;
}