// components/personas/iraqi-teacher/TeacherChat.tsx
/**
 * TeacherChat Component
 * مكون محادثة المعلم العراقي
 */

import React, { useState } from 'react';
import './TeacherChat.css';

interface Message {
  id: string;
  text: string;
  sender: 'teacher' | 'student';
  timestamp: Date;
  type?: 'text' | 'encouragement' | 'explanation';
}

interface TeacherChatProps {
  messages: Message[];
  onSendMessage?: (message: string) => void;
  isTyping?: boolean;
  teacherName?: string;
}

const TeacherChat: React.FC<TeacherChatProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  teacherName = 'الأستاذ أحمد'
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-IQ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="teacher-chat">
      <div className="teacher-chat__header">
        <div className="teacher-chat__teacher-info">
          <span className="teacher-chat__avatar">👨‍🏫</span>
          <div className="teacher-chat__teacher-name">
            {teacherName}
          </div>
          <div className="teacher-chat__status">
            {isTyping ? 'يكتب...' : 'متصل'}
          </div>
        </div>
      </div>

      <div className="teacher-chat__messages">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`teacher-chat__message teacher-chat__message--${message.sender}`}
          >
            <div className="teacher-chat__message-content">
              <div className="teacher-chat__message-text">
                {message.text}
              </div>
              <div className="teacher-chat__message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="teacher-chat__message teacher-chat__message--teacher">
            <div className="teacher-chat__typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {onSendMessage && (
        <div className="teacher-chat__input-area">
          <textarea
            className="teacher-chat__input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب سؤالك هنا حبيبي..."
            rows={2}
          />
          <button 
            className="teacher-chat__send-button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            إرسال 📤
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherChat;