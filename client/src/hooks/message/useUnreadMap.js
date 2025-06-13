import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function useUnreadMap(userId) {
  const [unreadMap, setUnreadMap] = useState(new Map())

  useEffect(() => {
    if (!userId) return

    const fetchUnreadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, is_read')
        .eq('receiver_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('❌ error fetching unread messages:', error)
        return
      }

      const map = new Map()

      data.forEach((msg) => {
        const sender = msg.sender_id
        const current = map.get(sender) || 0
        map.set(sender, current + 1)
      })

      setUnreadMap(map)
    }

    fetchUnreadMessages()
  }, [userId])

  return unreadMap
}
