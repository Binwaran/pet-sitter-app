import { supabase } from '@/utils/supabase'

export async function markMessagesAsRead(senderId, receiverId) {
  if (!senderId || !receiverId) return

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('is_read', false)

  if (error) {
    console.error('❌ Failed to mark messages as read:', error.message)
  }
}
