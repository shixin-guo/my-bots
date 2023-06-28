import { createClient } from '@supabase/supabase-js';

export const supabase =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.supabase ||
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.supabase = supabase;
}
