'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/utils/supabase'
import ChatList from '@/components/ChatList'
import ChatWindow from '@/components/ChatWindow'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [chatList, setChatList] = useState([])
  const router = useRouter();

  useEffect(() => {
    if (!user || !id) return

    const fetchChatData = async () => {
      console.log('[page.jsx] user:', user)
      console.log('[page.jsx] id from params:', id)

      // ✅ 1. Load messages (ระหว่าง 2 ฝั่ง)
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (msgError) console.error('❌ messages error:', msgError)
      setMessages(messagesData ?? [])

      // ✅ 2. Load user info (ฝั่งตรงข้าม)
      if (id !== user.id.toString()) {
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('id, name, profile_image_url')
          .eq('id', id)
          .single()

        if (userErr) console.error('❌ user error:', userErr)
        setOtherUser(userData)
      } else {
        setOtherUser(user)
      }
    }

    fetchChatData()
  }, [id, user])


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Chat List (Desktop Only) */}
      <div className="hidden sm:block w-[300px] border-r border-gray-200 bg-black text-white min-h-0">
        <ChatList
          selectedUserId={id}
          chatList={chatList}
          onSelectUser={(user) => {
            router.push(`/messages/${user.id}`)
          }}
        />

      </div>

      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow
          user={otherUser}
          currentUser={user}
          messages={messages}
        />
      </div>
    </div>
  )
}
