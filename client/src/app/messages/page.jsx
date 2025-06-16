"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import ChatList from "@/components/ChatList";
import { useRouter } from "next/navigation";

export default function MessageIndexPage() {
  const { user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChatList = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
      } else setChatList(data ?? []);
    };

    fetchChatList();
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chat List */}
      <div className="hidden sm:block w-[300px] border-r border-gray-200 bg-black text-white">
        <ChatList
          selectedUserId={null}
          chatList={chatList}
          onSelectUser={(user) => {
            if (user?.id) router.push(`/messages/${user.id}`);
          }}
        />
      </div>

      {/* Placeholder when no conversation selected */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Start a conversation!
      </div>
    </div>
  );
}
