
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

// System prompt to set context for the AI
const SYSTEM_PROMPT = `You are a helpful shopping assistant for our e-commerce website. 
Your goal is to:
- Provide friendly, concise assistance to website visitors
- Answer questions about products, shipping, returns, and pricing
- Give personalized recommendations when appropriate
- Maintain a professional but conversational tone
- Keep responses brief and to the point (1-3 sentences max)
- Never make up information about products or policies you don't know about
- Politely let users know if you need more information to help them

You are representing our brand, so be courteous and helpful at all times.`;

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
    const messages = [
      // Add system prompt as the first message
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];
    
    // Add chat history
    messages.push(...chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    })));

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

export const generateLocalResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Enhanced conversation patterns
  const conversationPatterns = [
    {
      keywords: ['help', 'assistance', 'support'],
      responses: [
        "I'm here to help! What specific information can I assist you with today?",
        "Our support team is ready. What questions do you have about our products or services?",
        "Need guidance? I'm your virtual assistant, ready to provide personalized recommendations."
      ]
    },
    {
      keywords: ['recommendation', 'suggest', 'what should', 'best product'],
      responses: [
        "Based on our current bestsellers, I recommend checking out our premium wireless headphones or ergonomic laptop stand.",
        "Our top-rated products include high-performance tech accessories and ergonomic office solutions.",
        "Looking for a great product? I can help you find something that matches your needs perfectly!"
      ]
    },
    {
      keywords: ['pricing', 'cost', 'expensive'],
      responses: [
        "We offer competitive pricing with high-quality products. Would you like to know more about our price ranges?",
        "Quality doesn't always mean expensive. We have options for every budget.",
        "Our pricing is transparent, and we offer great value for money across our product lines."
      ]
    },
    {
      keywords: ['shipping', 'delivery', 'arrive'],
      responses: [
        "We offer free shipping on orders over $50! Standard delivery takes 3-5 business days.",
        "Shipping is quick and reliable. Most orders are processed within 1-2 business days.",
        "Want to know more about our shipping options? I'm happy to provide details!"
      ]
    }
  ];

  // Find matching pattern
  for (const pattern of conversationPatterns) {
    if (pattern.keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
    }
  }

  // Fallback responses with more personality
  const genericResponses = [
    "Interesting point! How can I help you further?",
    "I'm listening. What else would you like to know?",
    "Our team is dedicated to providing the best shopping experience. How can I assist you today?",
    "I'm here to make your shopping experience smooth and enjoyable. What can I do for you?"
  ];

  // Return a random generic response if no specific pattern matches
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};
