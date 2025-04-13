
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const initialMessages: Message[] = [
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const { addItem, state } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate bot response after 1 second
    setTimeout(() => {
      const botResponse = generateBotResponse(newMessage);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userMessage: string): Message => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let responseText = '';
    
    if (lowerCaseMessage.includes('discount') || lowerCaseMessage.includes('coupon')) {
      responseText = "Great news! Use code WELCOME10 at checkout for 10% off your first order!";
    } else if (lowerCaseMessage.includes('shipping') || lowerCaseMessage.includes('delivery')) {
      responseText = "We offer free shipping on all orders over $50! Standard delivery takes 3-5 business days.";
    } else if (lowerCaseMessage.includes('return') || lowerCaseMessage.includes('refund')) {
      responseText = "Our return policy is simple: 30-day money-back guarantee, no questions asked!";
    } else if (lowerCaseMessage.includes('recommendation') || lowerCaseMessage.includes('suggest') || lowerCaseMessage.includes('what should')) {
      responseText = "Based on our best sellers, I'd recommend our premium wireless headphones or our ergonomic laptop stand. Both have excellent reviews!";
    } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      responseText = "Hello there! How can I help with your shopping today?";
    } else {
      responseText = "I'd be happy to help you with that! Is there anything specific you'd like to know about our products?";
    }
    
    return {
      id: Date.now().toString(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <div className="chat-bubble" onClick={toggleChat}>
        <MessageCircle className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className={`chat-window ${isMinimized ? 'w-72 h-12' : 'w-80 sm:w-96 h-96'}`}>
      <div className="bg-cart text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Shopping Assistant</h3>
        </div>
        <div className="flex items-center space-x-1">
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" className="bg-cart hover:bg-cart-hover">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
