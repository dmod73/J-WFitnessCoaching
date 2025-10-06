UPDATE public.courses
SET delivery_html_url = CASE slug
  WHEN 'starter-strong' THEN '/courses/starter-strong'
  WHEN 'elite-pro' THEN '/courses/elite-pro'
  WHEN 'team-power' THEN '/courses/team-power'
  ELSE delivery_html_url
END,
updated_at = now()
WHERE slug IN ('starter-strong', 'elite-pro', 'team-power');