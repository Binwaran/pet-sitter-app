import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChatWindow({ user, onClose, currentUser }) {
const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-5xl">🐾</div>
          <p>Start a conversation!</p>
        </div>
      </div>
    );
  }

  // เช็คสิทธิ์ว่าส่งได้ไหม
  const canSend = currentUser.role === 'owner' || messages.length > 0;

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
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="font-semibold text-lg">{user.name}</div>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => (
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
        ))}
      </div>

      {/* Input */}
      <div className="border-t flex items-center px-4 py-2 gap-2">
        <label htmlFor="image" className="cursor-pointer">
          📎
          <input type="file" id="image" className="hidden" />
        </label>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canSend}
          placeholder={
            canSend ? 'Message here...' : 'You can’t message this sitter yet.'
          }
          className="flex-1 px-4 py-2 border rounded-full outline-none disabled:bg-gray-100"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-orange-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

