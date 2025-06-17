"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import { useRouter, usePathname } from "next/navigation";
import { useNavigation } from "@/hooks/message/useNavigation";

export default function MessageIndexPage() {
  const { user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const router = useRouter();
  const { currentPath } = useNavigation();

  // บันทึก referrer ไว้ใน sessionStorage เพื่อให้สามารถใช้ข้ามคำขอได้
  useEffect(() => {
    try {
      // ตรวจสอบว่ามีการบันทึก referrer แล้วหรือไม่
      const storedReferrer = sessionStorage.getItem("messagesReferrer");

      // ถ้าไม่มี ให้ใช้ document.referrer
      if (!storedReferrer && document.referrer) {
        const url = new URL(document.referrer);
        const path = url.pathname;

        // ถ้ามาจากหน้าอื่นที่ไม่ใช่ /messages
        if (path && !path.includes("/messages")) {
          sessionStorage.setItem("messagesReferrer", path);
        }
      }
    } catch (e) {}
  }, []);

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
    <div className="flex h-screen w-full">
      {/* Chat List */}
      <div className="block w-full sm:max-w-[300px] lg:max-w-[368px] bg-black text-white min-h-0">
        <ChatList
          selectedUserId={null}
          chatList={chatList}
          onSelectUser={(user) => {
            if (user?.id) router.push(`/messages/${user.id}`);
          }}
        />
      </div>

      {/* Placeholder when no conversation selected */}
      <div className="hidden sm:flex items-center justify-center text-gray-400 w-full">
        <div className="flex flex-col items-center justify-center w-full gap-6">
          <img src="/assets/pinkpaw.svg" alt="Paw" className="w-20.5 h-21" />
          <p className="text-center text-[#AEB1C3] text-lg leading-6.5 font-medium">
            Start a conversation!
          </p>
        </div>
      </div>
    </div>
  );
}
