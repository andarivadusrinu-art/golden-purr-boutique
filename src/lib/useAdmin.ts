import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAdmin() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      checkRole(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkRole(data.session);
    });
    return () => sub.subscription.unsubscribe();

    function checkRole(s: Session | null) {
      if (!s) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(!!data);
          setLoading(false);
        });
    }
  }, []);

  return { session, isAdmin, loading };
}