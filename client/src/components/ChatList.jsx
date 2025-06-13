'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'
import useUnreadMessages from '@/hooks/message/useUnreadMessages'
import { useRouter } from 'next/navigation'
import Image from 'next/image'


export default function ChatList({ selectedUserId, onSelectUser }) {
  const { user } = useAuth()
  const [chatPreviewList, setChatPreviewList] = useState([])
  const router = useRouter()
  const unreadMap = useUnreadMessages(user?.id)

 useEffect(() => {
    if (!user?.id) return

    const fetchChatPreviews = async () => {
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

      messages.forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id

        // เก็บข้อความล่าสุดของแต่ละคู่แชท
        if (!latestMap.has(otherId)) {
          latestMap.set(otherId, msg)
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
        return {
          user: u,
          message: latestMessage
        }
      })

      setChatPreviewList(chatList)
    }

    fetchChatPreviews()
  }, [user])


  return (
    <div className="divide-y divide-gray-700">
      {/* 🔝 Logo = Home button */}
      <div
        onClick={() => router.push('/')}
        className="cursor-pointer px-4 py-4 flex items-center justify-center hover:bg-gray-800"
      >
        <Image
          src="/assets/sitter-logo-white.svg"  // ✅ รูปโลโก้นี้ต้องอยู่ใน public/assets
          alt="Logo"
          width={100}
          height={100}
        />
      </div>
      {chatPreviewList.map(({ user: chatUser, message }) => (
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
            {message?.sender_id !== user.id && message?.is_read === false && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadMap[chatUser.id] || 0}
                </span>
              )}

          </div>
        </div>
      ))}
    </div>
  )
}