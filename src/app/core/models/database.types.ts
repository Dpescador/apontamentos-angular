export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      apontamentos: {
        Row: {
          id: string;
          usuario_id: string;
          data: string;
          sprint: string | null;
          id_tarefa: string;
          tarefa: string;
          itens_trabalhados: string | null;
          horas: number;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string;
          data: string;
          sprint?: string | null;
          id_tarefa: string;
          tarefa: string;
          itens_trabalhados?: string | null;
          horas: number;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          data?: string;
          sprint?: string | null;
          id_tarefa?: string;
          tarefa?: string;
          itens_trabalhados?: string | null;
          horas?: number;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
