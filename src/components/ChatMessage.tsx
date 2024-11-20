import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.type === 'bot';
  
  return (
    <div className={`flex gap-3 ${isBot ? 'bg-gray-50' : ''} p-4`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${isBot ? 'text-gray-800' : 'text-gray-700'}`}>
          {message.content}
        </p>
      </div>
    </div>
  );
}