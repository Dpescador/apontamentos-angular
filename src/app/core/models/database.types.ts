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
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: Database['public']['Enums']['user_role'];
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: Database['public']['Enums']['user_role'];
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          role?: Database['public']['Enums']['user_role'];
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_list_users: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          email: string | null;
          role: string;
          criado_em: string;
          ultimo_acesso: string | null;
          quantidade_apontamentos: number;
          total_horas: number;
        }[];
      };
    };
    Enums: {
      user_role: 'USER' | 'ADMIN';
    };
    CompositeTypes: Record<string, never>;
  };
}
