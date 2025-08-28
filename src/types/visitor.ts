export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVisitorData {
  name: string;
  cpf: string;
  photo?: string;
}