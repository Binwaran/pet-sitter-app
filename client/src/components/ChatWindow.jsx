"use client";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/utils/supabase";
import { markMessagesAsRead } from "@/hooks/message/useMarkMessagesAsRead";
import BookNowButton from "./BookNowButton";
import { useRouter } from "next/navigation";

export default function ChatWindow({
  user,
  onClose,
  currentUser,
  messages: initialMessages = [],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  // 🆕 เพิ่ม state เพื่อติดตามว่าโหลดข้อความครั้งแรกแล้วหรือยัง
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const router = useRouter();
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageAudioRef = useRef(null);
  const typingAudioRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // 🔧 เปลี่ยนเป็น instant scroll สำหรับโหลดครั้งแรก
  const scrollToBottomInstant = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // 🔧 เฉพาะเมื่อโหลดข้อความครั้งแรกเท่านั้น
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      scrollToBottomInstant();
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  // 🗑️ ลบ auto-scroll สำหรับ typing indicator ออก

  const playMessageSound = () => {
    try {
      if (messageAudioRef.current) {
        messageAudioRef.current.currentTime = 0;
        messageAudioRef.current.play().catch(() => {
          // Ignore autoplay policy errors
        });
      }
    } catch (error) {
      // Ignore audio errors
    }
  };

  const playTypingSound = () => {
    try {
      if (typingAudioRef.current) {
        typingAudioRef.current.currentTime = 0;
        typingAudioRef.current.play().catch(() => {
          // Ignore autoplay policy errors
        });
      }
    } catch (error) {
      // Ignore audio errors
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    router.push("/messages");
  };

  useEffect(() => {
    if (!currentUser?.id || !user?.id) return;

    const channelName = `chat-room:${[currentUser.id, user.id]
      .sort()
      .join("-")}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new;

          const isCurrentChat =
            (newMessage.sender_id === user.id &&
              newMessage.receiver_id === currentUser.id) ||
            (newMessage.sender_id === currentUser.id &&
              newMessage.receiver_id === user.id);

          if (isCurrentChat) {
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === newMessage.id);
              if (exists) return prev;

              if (newMessage.sender_id !== currentUser.id) {
                playMessageSound();
              }

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
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, typing } = payload.payload;

        if (user_id !== currentUser.id && user_id === user.id) {
          setOtherUserTyping(typing);

          if (typing) {
            playTypingSound();
            setTimeout(() => {
              setOtherUserTyping(false);
            }, 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentUser?.id]);

  const sendTypingStatus = async (typing) => {
    if (!currentUser?.id || !user?.id) return;

    const channelName = `chat-room:${[currentUser.id, user.id]
      .sort()
      .join("-")}`;

    const channel = supabase.channel(channelName);

    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: currentUser.id,
        typing: typing,
      },
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;
    if (!currentUser?.id || !user?.id) {
      return;
    }

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const filename = `${currentUser.id}/${Date.now()}-${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(filename, imageFile);

      if (uploadError) {
        return;
      }

      const { data: urlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(filename);

      imageUrl = urlData?.publicUrl || null;
    }

    const { error: insertError } = await supabase.from("messages").insert([
      {
        sender_id: currentUser.id,
        receiver_id: user.id,
        content: input.trim(),
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      return;
    }

    if (isTyping) {
      setIsTyping(false);
      sendTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    setInput("");
    setImageFile(null);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser?.id || !user?.id) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      if (error) {
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

  useEffect(() => {
    if (!currentUser?.id || !user?.id) return;
    markMessagesAsRead(user.id, currentUser.id);
  }, [user?.id, currentUser?.id]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Audio elements */}
      <audio ref={messageAudioRef} preload="auto" style={{ display: "none" }}>
        <source src="/assets/sounds/message.mp3" type="audio/mpeg" />
      </audio>

      <audio ref={typingAudioRef} preload="auto" style={{ display: "none" }}>
        <source src="/assets/sounds/typing.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="flex gap-2 sm:gap-4 px-2.5 md:px-10 py-3 md:py-6 items-center md:justify-between bg-[#F6F6F9] w-full">
        <div className="flex items-center gap-2 sm:gap-4 w-full">
          <Image
            src={user?.profile_image_url || "/assets/avatar.png"}
            alt="Avatar"
            width={48}
            height={48}
            className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="font-bold text-lg md:text-2xl leading-8 whitespace-break-spaces">
            {user?.name || "Unknown"}
          </div>
          {otherUserTyping && (
            <div className="text-sm text-gray-500 italic">is typing...</div>
          )}
          <BookNowButton sitterId={user?.id} />
        </div>
        <div className="flex items-center w-fit justify-end gap-2 sm:gap-4">
          <button onClick={handleClose}>
            <X className="w-6 h-6 md:w-8 md:h-8 text-[#7B7E8F] cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 px-3 py-6 md:p-6 overflow-y-auto flex flex-col overflow-x-hidden gap-4 min-h-0 w-full"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center w-full min-h-0">
            <div className="text-center flex flex-col items-center justify-center gap-6">
              <div className="flex flex-col items-center justify-center">
                <Image
                  src="/assets/pinkpaw.svg"
                  alt="pet icon"
                  width={82}
                  height={84}
                />
              </div>
              <p className="text-center text-[#AEB1C3] text-lg leading-6.5 font-medium">
                Start a conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isImageOnly =
                msg.image_url && (!msg.content || msg.content.trim() === "");
              return (
                <div
                  key={msg.id}
                  className={
                    isImageOnly
                      ? `${isMe ? "self-end" : "self-start"} `
                      : `px-3 py-2 md:px-6 md:py-4 max-w-xs text-sm md:text-base leading-7 font-medium ${
                          isMe
                            ? "self-end bg-[#E44A0C] text-white rounded-2xl rounded-br-none md:rounded-3xl md:rounded-br-none"
                            : "self-start bg-white border border-[#DCDFED] text-[#31333C] rounded-2xl rounded-bl-none md:rounded-3xl md:rounded-bl-none"
                        }`
                  }
                >
                  {!isImageOnly && (
                    <div className="break-words max-h-60 md:max-h-80 max-w-60 md:max-w-80">
                      {msg.content}
                    </div>
                  )}
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="attachment"
                      className="max-h-60 md:max-h-80 max-w-60 md:max-w-80 rounded-lg object-cover"
                    />
                  )}
                </div>
              );
            })}

            {otherUserTyping && (
              <div className="self-start px-3 py-2 md:px-6 md:py-4 bg-white border border-[#DCDFED] text-[#31333C] rounded-2xl rounded-bl-none md:rounded-3xl md:rounded-bl-none">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">typing...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#DCDFED] flex items-center px-5 md:px-10 py-3 md:py-6 gap-2 md:gap-6 relative">
        <div className="flex flex-row items-center gap-2 md:gap-6 flex-1">
          <div className="bg-[#F6F7FC] rounded-full p-1.5 md:p-3.5 gap-1.5 flex items-center justify-center active:scale-95 transition-transform duration-100 hover:bg-[#DCDFED]/50">
            <label htmlFor="image" className="cursor-pointer">
              <Image
                src="/assets/picture.svg"
                alt="pet icon"
                width={24}
                height={24}
                className="w-4 h-4 md:w-6 md:h-6"
              />
              <input
                type="file"
                id="image"
                className="hidden"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImageFile(file);
                }}
              />
            </label>
          </div>
          <input
            id="message-input"
            name="message-input"
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Message here..."
            className="flex-1 gap-2 md:gap-6 outline-none disabled:bg-gray-100 leading-7 font-medium placeholder:text-[#3A3B46] text-[#3A3B46] text-sm md:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            autoComplete="off"
          />
        </div>

        {imageFile && (
          <div className="flex flex-col items-center justify-center py-3 md:py-6 absolute left-0 bottom-13 md:bottom-25 w-full bg-gray-950/50">
            <div className="relative">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="max-w-[120px] max-h-[120px] md:max-w-[160px] md:max-h-[160px] rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-1 right-1 bg-white/50 bg-opacity-80 rounded-full p-0.5 md:p-1 shadow hover:bg-gray-950/50 text-gray-950/50 hover:text-white"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        <div className="bg-[#FF7037] rounded-full p-1 md:p-3 flex items-center justify-center gap-2 shadow-[2px_2px_12px_0px_#4032851F] active:scale-95 transition-transform duration-100 hover:bg-[#FF986F]">
          <button
            onClick={handleSend}
            className="text-white disabled:opacity-50 cursor-pointer"
          >
            <Image
              src="/assets/paperplane.svg"
              alt="pet icon"
              width={24}
              height={24}
              className="w-4 h-4 md:w-6 md:h-6"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
