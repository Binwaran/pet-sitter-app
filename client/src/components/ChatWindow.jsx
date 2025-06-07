'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/utils/supabase';

export default function ChatWindow({
  user,
  onClose = () => {},
  currentUser,
  messages: initialMessages = [],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
  if (!currentUser?.id || !user?.id) return;

  const channelName = `chat-room:${[currentUser.id, user.id].sort().join('-')}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const newMessage = payload.new;

        const isCurrentChat =
          (newMessage.sender_id === user.id && newMessage.receiver_id === currentUser.id) ||
          (newMessage.sender_id === currentUser.id && newMessage.receiver_id === user.id);

        if (isCurrentChat) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;

            return [
              ...prev,
              {
                id: newMessage.id,
                senderId: newMessage.sender_id,
                content: newMessage.content,
                image_url: newMessage.image_url,
              },
            ];
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id, currentUser?.id]);

  // ✅ ฟังก์ชันส่งข้อความ
  const handleSend = async () => {
    if (!input.trim() && !imageFile) return
    if (!currentUser?.id || !user?.id) {
      console.error('❌ currentUser หรือ user ไม่มี id');
      return
    }

    let imageUrl = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const filename = `${currentUser.id}/${Date.now()}-${uuidv4()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filename, imageFile)

      if (uploadError) {
        console.error('❌ Image upload failed:', uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filename)

      imageUrl = urlData?.publicUrl || null
    }

    const { error: insertError } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: currentUser.id,
          receiver_id: user.id,
          content: input.trim(),
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        },
      ])

    if (insertError) {
      console.error('❌ Failed to send message:', insertError.message)
      return
    }

    setInput('')
    setImageFile(null)
  }

  useEffect(() => {
  const fetchMessages = async () => {
    if (!currentUser?.id || !user?.id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch messages:', error.message);
      return;
    }

    setMessages(
      data.map((msg) => ({
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        image_url: msg.image_url,
      }))
    );
  };

  fetchMessages();
}, [currentUser?.id, user?.id]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100">
        <div className="flex items-center gap-4">
          <Image
            src={user?.profile_image_url || "/assets/avatar.png"}
            alt="Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="font-semibold text-2xl">{user?.name || "Unknown"}</div>
        </div>
        <div>
          <button onClick={onClose}>
            <X className="w-7 h-7 text-gray-500" />
          </button>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 min-h-0">
            <div className="text-center">
              <div className="flex flex-col items-center justify-center text-5xl mb-4">
                <Image
                  src="/assets/Vector (1).png"
                  alt="pet icon"
                  width={100}
                  height={100}
                />
              </div>
              <p className="text-center text-gray-400">Start a conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`px-4 py-2 rounded-xl max-w-sm ${
                msg.senderId === currentUser.id
                  ? 'self-end bg-orange-500 text-white'
                  : 'self-start bg-white border text-gray-700'
              }`}
            >
              <div>{msg.content}</div>
              {msg.image_url && (
                <img
                  src={msg.image_url}
                  alt="attachment"
                  className="mt-2 max-w-xs rounded-lg"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-300 flex items-center px-4 py-2 gap-2">
        <label htmlFor="image" className="cursor-pointer">
          <Image
                  src="/assets/upload-image.png"
                  alt="pet icon"
                  width={70}
                  height={70}
                />
          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message here..."
          className="flex-1 px-4 py-2 outline-none disabled:bg-gray-100"
        />

        <button
          onClick={handleSend}
          className="text-white px-4 py-2 disabled:opacity-50"
        >
          <Image
                  src="/assets/send-button.png"
                  alt="pet icon"
                  width={80}
                  height={80}
                />
        </button>
      </div>
    </div>
  );
}
