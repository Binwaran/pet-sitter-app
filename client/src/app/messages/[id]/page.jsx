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
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, profile_image_url')
        .eq('id', id)
        .single()
      setOtherUser(userData)

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })
      setMessages(messagesData)
    }

    const fetchChatList = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      // ดึง list ผู้ใช้จาก messages ทั้งหมดไปใช้ได้
      setChatList(data || [])
    }

    fetchChatList()
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
