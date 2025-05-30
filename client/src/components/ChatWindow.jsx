import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

// MOCK MODE: ลบออกเมื่อเชื่อมระบบจริง
const mockUser = {
  id: 'mock-sitter-1',
  name: 'Ploy the Pet Sitter',
  profile_image_url: '/sitter.jpg',
};

const mockCurrentUser = {
  id: 'mock-owner-1',
  name: 'Nofffie',
  role: 'owner',
  profileImage: '/user.jpg',
};

const mockMessages = [
  {
    id: 1,
    senderId: 'mock-owner-1',
    content: 'Hello! I’d like to book you.',
  },
  {
    id: 2,
    senderId: 'mock-sitter-1',
    content: 'Sure! When do you need me?',
  },
];

export default function ChatWindow({
  user = mockUser,
  onClose = () => {},
  currentUser = mockCurrentUser,
  messages: initialMessages = mockMessages,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: currentUser.id,
      content: input.trim(),
    };

    setMessages([...messages, newMsg]);
    setInput('');
  };

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
              {msg.content}
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
          <input type="file" id="image" className="hidden" />
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
