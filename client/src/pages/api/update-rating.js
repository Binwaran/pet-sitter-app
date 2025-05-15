import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { sitter_id } = req.body
  if (!sitter_id) {
    return res.status(400).json({ message: 'Missing sitter_id' })
  }

  // 1. ดึงรีวิวทั้งหมดของ sitter นี้
  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('sitter_id', sitter_id)

  if (reviewError) {
    return res.status(500).json({ message: 'Failed to fetch reviews', error: reviewError })
  }

  // 2. คำนวณค่าเฉลี่ย
  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  const avg = reviews.length > 0 ? total / reviews.length : 0

  // 3. อัปเดต average_rating ใน pet_sitter
  const { error: updateError } = await supabase
    .from('pet_sitter')
    .update({ average_rating: avg })
    .eq('uuid', sitter_id)

  if (updateError) {
    return res.status(500).json({ message: 'Failed to update average rating', error: updateError })
  }

  return res.status(200).json({ message: 'Average rating updated', average_rating: avg })
}
