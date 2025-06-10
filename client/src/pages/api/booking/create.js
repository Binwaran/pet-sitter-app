import { generateTrackingNo } from '@/utils/generateTrackingNo';
import { supabase } from '@/services/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id, pet_id, ...otherData } = req.body;

  const tracking_no = generateTrackingNo();

  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        user_id,
        pet_id,
        tracking_no,
        ...otherData,
      },
    ]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ booking: data[0] });
}
