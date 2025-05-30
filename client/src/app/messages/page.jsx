'use client'; // สำหรับ Next.js App Router
import { useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

const currentUser = {
  id: 'mock-owner-1',
  role: 'owner', // เปลี่ยนเป็น 'sitter' เพื่อทดสอบ role อื่น
  name: 'Nofffie',
  profileImage: '/user.jpg',
};

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  

  return (
    <div className="flex h-screen">
      <ChatList
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
      />
      <ChatWindow
        user={selectedUser}
        currentUser={currentUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
