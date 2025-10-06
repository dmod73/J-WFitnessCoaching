import { createClientServer } from './supabase-server';

const ACCESS_STATUSES = ['paid', 'fulfilled'] as const;

export async function hasCourseAccess(userId: string, courseId: string): Promise<boolean> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('order_items')
    .select('id, course_id, order:orders(status, user_id)')
    .eq('course_id', courseId)
    .eq('order.user_id', userId)
    .in('order.status', ACCESS_STATUSES)
    .maybeSingle<{ id: string; course_id: string; order: { status: string; user_id: string } }>();

  if (error && error.code !== 'PGRST116') {
    console.error('[course-access] Error comprobando acceso:', error.message);
    throw error;
  }

  return Boolean(data?.order && ACCESS_STATUSES.includes(data.order.status as typeof ACCESS_STATUSES[number]));
}