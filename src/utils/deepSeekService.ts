
import { toast } from "@/hooks/use-toast";

// Interface for chat messages
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// This would typically come from environment variables
let apiKey = "";

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const hasApiKey = (): boolean => {
  return apiKey.length > 0;
};

export const generateAIResponse = async (
  userMessage: string, 
  chatHistory: ChatMessage[]
): Promise<string> => {
  if (!apiKey) {
    toast({
      title: "API Key Missing",
      description: "Please set your DeepSeek API key in the settings",
      variant: "destructive",
    });
    return "I'm unable to respond right now. Please make sure your API key is configured.";
  }

  try {
    // Format chat history for DeepSeek API
    const messages = chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Add the new user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    toast({
      title: "AI Response Error",
      description: error instanceof Error ? error.message : "Failed to get AI response",
      variant: "destructive",
    });
    return "I encountered an error while processing your request. Please try again later.";
  }
};

// Fallback to generate response when API is not configured
export const generateLocalResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  if (lowerCaseMessage.includes('discount') || lowerCaseMessage.includes('coupon')) {
    return "Great news! Use code WELCOME10 at checkout for 10% off your first order!";
  } else if (lowerCaseMessage.includes('shipping') || lowerCaseMessage.includes('delivery')) {
    return "We offer free shipping on all orders over $50! Standard delivery takes 3-5 business days.";
  } else if (lowerCaseMessage.includes('return') || lowerCaseMessage.includes('refund')) {
    return "Our return policy is simple: 30-day money-back guarantee, no questions asked!";
  } else if (lowerCaseMessage.includes('recommendation') || lowerCaseMessage.includes('suggest') || lowerCaseMessage.includes('what should')) {
    return "Based on our best sellers, I'd recommend our premium wireless headphones or our ergonomic laptop stand. Both have excellent reviews!";
  } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
    return "Hello there! How can I help with your shopping today?";
  } else {
    return "I'd be happy to help you with that! Is there anything specific you'd like to know about our products?";
  }
};
