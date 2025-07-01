'use client';

import { useRef } from 'react';
import { useParams } from 'next/navigation';
import ConversationList from '@/components/ConversationList';
import MessageThread from '@/components/MessageThread';
import MessageInput from '@/components/MessageInput';

export default function MessagesPage() {
  const params = useParams();
  const messageThreadRef = useRef<{ reload: () => void }>();
  return (
    <div className="flex h-[80vh] border rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar: Conversation List */}
      <aside className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <ConversationList />
      </aside>
      {/* Main: Conversation Thread */}
      <main className="flex-1 flex flex-col">
        {params?.conversationId ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageThread ref={messageThreadRef} />
            </div>
            <MessageInput onMessageSent={() => messageThreadRef.current?.reload()} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting.
          </div>
        )}
      </main>
    </div>
  );
}