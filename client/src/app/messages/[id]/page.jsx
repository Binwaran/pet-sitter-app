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
  if (!user || !id) return;

  const fetchData = async () => {
    // ดึง messages ทั้งหมด
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    setMessages(messagesData);

    // หา user id ของฝั่งตรงข้าม
    const chatWithId = messagesData?.find(
      (msg) =>
        msg.sender_id.toString() === id.toString() ||
        msg.receiver_id.toString() === id.toString()
    );

    const otherUserId =
      chatWithId?.sender_id === user.id
        ? chatWithId.receiver_id
        : chatWithId?.sender_id;

    if (otherUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, profile_image_url')
        .eq('id', otherUserId)
        .single();

      setOtherUser(userData);
    }

    // โหลด chatList ด้านซ้าย
    const { data: chatListData } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    setChatList(chatListData || []);
  };

  fetchData();
}, [id, user]);


    

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
