import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthResult<T> = {
  data: T | null;
  error: string | null;
};

export const authService = {
  async signUp(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthResult<User>> {
    // Instancia dentro da função — nunca no topo do módulo
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName } },
    });

    if (error) return { data: null, error: error.message };
    return { data: data.user, error: null };
  },

  async signIn(email: string, password: string): Promise<AuthResult<User>> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { data: null, error: error.message };
    return { data: data.user, error: null };
  },

  async signOut(): Promise<AuthResult<null>> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  },

  async getUser(): Promise<AuthResult<User>> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: error.message };
    return { data: data.user, error: null };
  },
};
