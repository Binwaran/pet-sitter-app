import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchSitters = async () => {
  console.log('Fetching sitters from Supabase...');
  const { data, error } = await supabase.from('pet_sitter').select('*');
  if (error) {
    console.error('Error fetching sitters from Supabase:', error);
    throw new Error(error.message);
  }
  console.log('Fetched sitters:', data);
  return data;
};