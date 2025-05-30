import Image from 'next/image';

const mockConversations = [
  {
    id: '1',
    name: 'Jane Maison',
    lastMessage: 'You: hello!',
    profileImage: '/jane.jpg',
    unread: 4,
  },
  {
    id: '2',
    name: 'John Smith',
    lastMessage: 'yeah my home is so big',
    profileImage: '/john.jpg',
    unread: 1,
  },
];

export default function ChatList({ onSelectUser, selectedUser }) {
  return (
    <div className="w-[300px] bg-black text-white p-4">
      <h2 className="text-xl mb-4">Messages</h2>
      {mockConversations.map((user) => (
        <div
          key={user.id}
          className={`flex items-center justify-between mb-3 cursor-pointer p-2 rounded-lg ${
            selectedUser?.id === user.id ? 'bg-[#2c2c2c]' : ''
          }`}
          onClick={() => onSelectUser(user)}
        >
          <div className="flex items-center gap-3">
            <Image src={user.profileImage} width={40} height={40} className="rounded-full" alt="avatar" />
            <div>
              <p>{user.name}</p>
              <p className="text-xs text-gray-400">{user.lastMessage}</p>
            </div>
          </div>
          {user.unread > 0 && (
            <span className="text-sm bg-orange-500 rounded-full px-2 text-white">{user.unread}</span>
          )}
        </div>
      ))}
    </div>
  );
}
