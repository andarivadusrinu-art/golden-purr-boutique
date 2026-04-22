
-- Admin invitations table
CREATE TABLE public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invitations" ON public.admin_invitations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  _email TEXT;
  _invitation_id UUID;
BEGIN
  -- Find valid invitation
  SELECT id, email INTO _invitation_id, _email
  FROM public.admin_invitations
  WHERE token = _token AND used_at IS NULL AND expires_at > now();

  IF _invitation_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Mark as used
  UPDATE public.admin_invitations SET used_at = now() WHERE id = _invitation_id;

  -- Grant admin role to current user (must be signed in)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
