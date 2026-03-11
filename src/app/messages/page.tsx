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
    <div className="page-mobile-first flex flex-col md:flex-row h-[80vh] min-h-[400px] border rounded-lg overflow-hidden shadow-lg w-full min-w-0">
      {/* Sidebar: Conversation List - full width on mobile, sidebar on md+ */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-gray-50 border-b md:border-b-0 md:border-r p-4 overflow-y-auto max-h-[40vh] md:max-h-none">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Conversations</h2>
        <ConversationList />
      </aside>
      {/* Main: Conversation Thread */}
      <main className="flex-1 flex flex-col min-h-0">
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