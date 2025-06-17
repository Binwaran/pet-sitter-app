"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import useUnreadMap from "@/hooks/message/useUnreadMap";
import Image from "next/image";
import { useNavigation } from "@/hooks/message/useNavigation";

export default function ChatList({
  selectedUserId,
  onSelectUser,
  showBackButton = true,
}) {
  const { user } = useAuth();
  const [chatPreviewList, setChatPreviewList] = useState([]);
  const unreadMap = useUnreadMap(user?.id);
  const { goBackSafely } = useNavigation();

  const handleBackClick = () => {
    // ใช้ฟังก์ชันนี้เมื่อกดปุ่มย้อนกลับ
    goBackSafely();
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchChatPreviews = async () => {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*, sender_id, receiver_id, is_read")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        return;
      }

      const latestMap = new Map();

      messages.forEach((msg) => {
        const otherId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        // เก็บข้อความล่าสุดของแต่ละคู่แชท
        if (!latestMap.has(otherId)) {
          latestMap.set(otherId, msg);
        }
      });

      const otherUserIds = Array.from(latestMap.keys());
      if (otherUserIds.length === 0) return;

      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, name, profile_image_url")
        .in("id", otherUserIds);

      if (userError) {
        return;
      }

      const chatList = users.map((u) => {
        const latestMessage = latestMap.get(u.id) || null;
        return {
          user: u,
          message: latestMessage,
        };
      });

      setChatPreviewList(chatList);
    };

    fetchChatPreviews();
  }, [user]);

  // Helper function to format the message preview
  const formatMessagePreview = (message, chatUser) => {
    if (!message) return "No messages yet";

    // ตรวจสอบประเภทไฟล์จาก url
    const isGif = message.image_url && /\.gif$/i.test(message.image_url);
    const isImage =
      message.image_url &&
      /\.(jpg|jpeg|png|webp|svg)$/i.test(message.image_url); // ไม่รวม gif
    const isVideo =
      message.image_url &&
      /\.(mp4|mov|avi|wmv|webm|mkv)$/i.test(message.image_url);
    const isAttachment = message.image_url && !isImage && !isVideo && !isGif;

    const isMe = message.sender_id === user?.id;

    if (isGif && (!message.content || message.content.trim() === "")) {
      return isMe
        ? "You sent a GIF."
        : `${chatUser.name || "They"} sent a GIF.`;
    }
    if (isImage && (!message.content || message.content.trim() === "")) {
      return isMe
        ? "You sent a photo."
        : `${chatUser.name || "They"} sent a photo.`;
    }
    if (isVideo && (!message.content || message.content.trim() === "")) {
      return isMe
        ? "You sent a video."
        : `${chatUser.name || "They"} sent a video.`;
    }
    if (isAttachment && (!message.content || message.content.trim() === "")) {
      return isMe
        ? "You sent an attachment."
        : `${chatUser.name || "They"} sent an attachment.`;
    }
    if (message.content) {
      return isMe ? `You: ${message.content}` : message.content;
    }
    return "No messages yet";
  };

  return (
    <div className="py-10 flex flex-col h-full overflow-y-auto bg-black gap-6">
      {/* 🔝 Logo = Home button */}
      <div className="px-10 flex flex-row gap-3 items-center justify-center">
        {showBackButton && (
          <div className="w-fit flex items-center justify-start">
            <Image
              src="/assets/arrowl.svg"
              alt="Back"
              width={24}
              height={24}
              onClick={handleBackClick}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            />
          </div>
        )}
        <div className="w-full items-center justify-start text-white font-bold text-2xl leading-8">
          Messages
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatPreviewList.map(({ user: chatUser, message }) => (
          <div
            key={chatUser.id}
            className={`px-10 py-4 cursor-pointer hover:bg-[#3A3B46]/50 transition-colors duration-300 ${
              selectedUserId === chatUser.id ? "bg-[#3A3B46]" : ""
            }`}
            onClick={() => onSelectUser(chatUser)}
          >
            <div className="flex items-center gap-3">
              <img
                src={chatUser.profile_image_url || "/default-avatar.png"}
                alt={chatUser.name}
                className="w-15 h-15 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex flex-col truncate">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-white font-medium leading-7">
                    {chatUser.name || "No Name"}
                  </div>
                  {/* 🔥 แจ้งเตือน New ถ้ายังไม่ได้อ่าน และไม่ใช่ข้อความของตัวเอง */}
                  {message?.sender_id !== user.id &&
                    message?.is_read === false && (
                      <span className="bg-[#FF7037] w-6 h-6 rounded-full flex items-center justify-center">
                        <p className="text-white text-xs flex items-center justify-center leading-6 font-medium h-4 w-1.5">
                          {unreadMap.get(message.sender_id) || 0}
                        </p>
                      </span>
                    )}
                </div>
                {/* 🔥 แสดงข้อความล่าสุด */}
                <div className="text-[#7B7E8F] text-sm leading-5">
                  {formatMessagePreview(message, chatUser)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
