import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function useUnreadMessages(currentUserId) {
  const [unreadMap, setUnreadMap] = useState(new Map())

  useEffect(() => {
    if (!currentUserId) return

    const fetchUnread = async () => {
      console.log('📥 fetchUnread called for:', currentUserId)
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, is_read')
        .eq('receiver_id', currentUserId)
        .eq('is_read', false)

      if (error) {
        console.error('❌ Failed to fetch unread messages:', error)
        return
      }

      console.log('📊 unread data:', data)

      const map = new Map()
      data.forEach((msg) => {
        const senderId = msg.sender_id
        map.set(senderId, (map.get(senderId) || 0) + 1)
      })

      setUnreadMap(map)
    }

    fetchUnread()

    const channel = supabase
      .channel(`unread-message-count-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
            const msg = payload.new
            // ✅ เงื่อนไขใหม่: ถ้า current user คือ “คนรับ” และยังไม่อ่าน
            if (msg.receiver_id === currentUserId && msg.is_read === false) {
                console.log('🟡 Realtime message for current user:', msg)
                fetchUnread()
            }
            }
        )
        .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  return unreadMap
}