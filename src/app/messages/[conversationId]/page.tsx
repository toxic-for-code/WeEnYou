"use client";
import React, { useRef } from 'react';
import { useParams } from 'next/navigation';
import ConversationList from '@/components/ConversationList';
import MessageThread from '@/components/MessageThread';
import MessageInput from '@/components/MessageInput';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.conversationId;
  const threadRef = useRef<{ reload: () => void }>(null);

  return (
    <div className="h-[80vh] border rounded-lg overflow-hidden shadow-lg flex flex-col">
      {/* Main: Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageThread ref={threadRef} />
      </div>
      <div className="border-t p-4">
        <MessageInput onMessageSent={() => threadRef.current?.reload()} />
      </div>
    </div>
  );
} 