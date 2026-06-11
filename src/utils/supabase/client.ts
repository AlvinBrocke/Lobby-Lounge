import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
<<<<<<< HEAD
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
=======
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
>>>>>>> feature/ui-ux

export const createClient = () => {
  return createBrowserClient(supabaseUrl!, supabaseKey!);
};
