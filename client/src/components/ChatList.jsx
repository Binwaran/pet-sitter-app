'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'

export default function ChatList({ selectedUserId, onSelectUser }) {
  const { user } = useAuth()
  const [chatPreviewList, setChatPreviewList] = useState([])

  // 🔁 โหลดข้อความล่าสุด + count unread
  const fetchChatPreviews = async () => {
    if (!user?.id) return

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender_id, receiver_id, is_read')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ error fetching messages:', error)
      return
    }

    const latestMap = new Map()
    const unreadCountMap = new Map()

    messages.forEach((msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id

      // ดึงข้อความล่าสุด
      if (!latestMap.has(otherId)) {
        latestMap.set(otherId, msg)
      }

      // นับ unread
      if (msg.receiver_id === user.id && msg.is_read === false) {
        unreadCountMap.set(otherId, (unreadCountMap.get(otherId) || 0) + 1)
      }
    })

    const otherUserIds = Array.from(latestMap.keys())
    if (otherUserIds.length === 0) return

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, profile_image_url')
      .in('id', otherUserIds)

    if (userError) {
      console.error('❌ error fetching user info:', userError)
      return
    }

    const chatList = users.map((u) => {
      const latestMessage = latestMap.get(u.id) || null
      const unreadCount = unreadCountMap.get(u.id) || 0
      return {
        user: u,
        message: latestMessage,
        unreadCount,
      }
    })

    setChatPreviewList(chatList)
  }

  // 📌 โหลดตอน mount
  useEffect(() => {
    fetchChatPreviews()
  }, [user])

  // 🔔 subscribe realtime insert
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`chat-preview-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new
          if (msg.receiver_id === user.id || msg.sender_id === user.id) {
            fetchChatPreviews()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])
  

  return (
    <div className="divide-y divide-gray-700">
      {chatPreviewList.map(({ user: chatUser, message, unreadCount }) => (
        <div
          key={chatUser.id}
          className={`p-4 cursor-pointer hover:bg-gray-800 ${
            selectedUserId === chatUser.id ? 'bg-gray-900' : ''
          }`}
          onClick={() => onSelectUser(chatUser)}
        >
          <div className="flex items-center space-x-3">
            <img
              src={chatUser.profile_image_url || '/default-avatar.png'}
              alt={chatUser.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="text-white font-medium">{chatUser.name || 'No Name'}</div>
            </div>
            {/* 🔥 แจ้งเตือน New ถ้ายังไม่ได้อ่าน และไม่ใช่ข้อความของตัวเอง */}
            {message?.sender_id !== user.id && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
