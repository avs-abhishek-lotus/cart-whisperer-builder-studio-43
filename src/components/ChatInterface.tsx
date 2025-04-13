
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRole } from '@/context/RoleContext';
import { 
  generateAIResponse, 
  generateLocalResponse, 
  hasApiKey,
  ChatMessage
} from '@/utils/deepSeekService';
import ChatSettings from './ChatSettings';
import RoleGuard from './RoleGuard';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    text: "Hi there! I'm your shopping assistant. How can I help you find the perfect products today?",
    sender: 'bot',
    timestamp: new Date(),
  },
];

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { addItem, state } = useCart();
  const { role } = useRole();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const openSettings = () => {
    setSettingsOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsWaiting(true);
    
    try {
      let botResponse: string;
      
      // Use AI response if API key is set and user has access, otherwise use local fallback
      if (hasApiKey() && (role === 'owner' || role === 'admin')) {
        botResponse = await generateAIResponse(newMessage, messages);
      } else {
        // Simulate network delay for local response
        await new Promise(resolve => setTimeout(resolve, 1000));
        botResponse = generateLocalResponse(newMessage);
      }
      
      const botMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessageObj]);
    } catch (error) {
      console.error("Error handling message:", error);
    } finally {
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <div className="chat-bubble fixed bottom-6 right-6 bg-cart text-white p-4 rounded-full shadow-lg cursor-pointer z-50 flex items-center justify-center hover:bg-cart-hover transition-colors" onClick={toggleChat}>
        <MessageCircle className="h-6 w-6" />
      </div>
    );
  }

  return (
    <>
      <div className={`chat-window fixed bottom-6 right-6 bg-white rounded-lg shadow-xl overflow-hidden z-50 transition-all ${isMinimized ? 'w-72 h-12' : 'w-80 sm:w-96 h-96'}`}>
        <div className="bg-cart text-white p-3 flex justify-between items-center">
          <div className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Shopping Assistant</h3>
          </div>
          <div className="flex items-center space-x-1">
            <RoleGuard allowedRoles={['owner', 'admin']}>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={openSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            </RoleGuard>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={toggleMinimize}>
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={toggleChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <ScrollArea className="flex-1 p-4 h-[calc(100%-7rem)]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-cart text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isWaiting && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={isWaiting}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-cart hover:bg-cart-hover"
                disabled={isWaiting || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
      
      <ChatSettings 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </>
  );
};

export default ChatInterface;
