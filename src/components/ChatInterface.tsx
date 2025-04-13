
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRole } from '@/context/RoleContext';
import { useCart } from '@/hooks/useCart';
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
    role: 'agent'
  },
];

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messageRole, setMessageRole] = useState<'visitor' | 'agent'>('visitor');
  const [useAI, setUseAI] = useState(false);
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

  // Reset to visitor role when user role changes to visitor
  useEffect(() => {
    if (role === 'visitor') {
      setMessageRole('visitor');
      setUseAI(false);
    }
  }, [role]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      role: messageRole,
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsWaiting(true);
    
    try {
      let botResponse: string;
      let responseRole: 'agent' | 'deepseek' = 'agent';
      
      // Pass the entire message history to DeepSeek if AI is enabled
      if (useAI && hasApiKey() && (role === 'owner' || role === 'admin')) {
        // Pass all previous messages for context
        botResponse = await generateAIResponse(newMessage, messages);
        responseRole = 'deepseek';
        console.log("Using DeepSeek AI with full conversation context and function calling");
      } else {
        // Simulate network delay for local response
        await new Promise(resolve => setTimeout(resolve, 1000));
        botResponse = generateLocalResponse(newMessage);
        console.log("Using local response generator");
      }
      
      const botMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        role: responseRole,
      };
      
      setMessages(prev => [...prev, botMessageObj]);
    } catch (error) {
      console.error("Error handling message:", error);
    } finally {
      setIsWaiting(false);
    }
  };

  // Get message style based on role
  const getMessageStyle = (message: ChatMessage) => {
    if (message.sender === 'user') {
      return 'bg-cart text-white';
    } else if (message.role === 'deepseek') {
      return 'bg-blue-600 text-white';
    } else if (message.role === 'agent') {
      return 'bg-green-600 text-white';
    } else {
      return 'bg-muted';
    }
  };

  const getRoleBadge = (message: ChatMessage) => {
    if (!message.role) return null;
    
    const badges = {
      visitor: { bg: 'bg-gray-200 text-gray-800', text: 'Visitor' },
      agent: { bg: 'bg-green-200 text-green-800', text: 'Agent' },
      deepseek: { bg: 'bg-blue-200 text-blue-800', text: 'DeepSeek' },
    };
    
    const badge = badges[message.role];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badge.bg} mr-2`}>
        {badge.text}
      </span>
    );
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
      <div className={`chat-window fixed bottom-6 right-6 bg-white rounded-lg shadow-xl overflow-hidden z-50 transition-all ${isMinimized ? 'w-72 h-12' : 'w-80 sm:w-96 h-[500px]'}`}>
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
            <ScrollArea className="flex-1 p-4 h-[calc(100%-11rem)]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${getMessageStyle(message)}`}
                    >
                      {/* Only show role badges to admin/owner */}
                      {(role === 'owner' || role === 'admin') && (
                        <div className="flex items-center mb-1">
                          {getRoleBadge(message)}
                          <p className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}
                      {/* For visitors just show the time */}
                      {role === 'visitor' && (
                        <p className="text-xs opacity-70 mb-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                      <p>{message.text}</p>
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
            
            <div className="border-t p-3">
              {/* Different controls based on user role */}
              {role === 'visitor' ? (
                // Simple interface for visitors
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
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
              ) : (
                // Advanced interface for admin/owner
                <>
                  <div className="flex justify-between items-center mb-2">
                    <RadioGroup 
                      defaultValue="visitor" 
                      className="flex space-x-4" 
                      value={messageRole}
                      onValueChange={(value) => setMessageRole(value as 'visitor' | 'agent')}
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="visitor" id="visitor" />
                        <Label htmlFor="visitor">Visitor</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="agent" id="agent" />
                        <Label htmlFor="agent">Agent</Label>
                      </div>
                    </RadioGroup>
                    
                    {hasApiKey() && (
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="use-ai"
                          checked={useAI}
                          onChange={(e) => setUseAI(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="use-ai" className="text-xs">Use DeepSeek AI</Label>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex gap-2">
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
