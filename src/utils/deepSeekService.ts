import { toast } from "@/hooks/use-toast";

// Interface for chat messages
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  role?: 'visitor' | 'agent' | 'deepseek';
}

// Product interface that matches the schema used in the cart
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  features?: string[];
}

// Sample product catalog for recommendations
const PRODUCT_CATALOG: Product[] = [
  {
    id: "headphones-001",
    name: "Premium Wireless Headphones",
    price: 129.99,
    description: "High-quality noise-canceling headphones with 30hr battery life",
    image: "/products/headphones.jpg",
    category: "audio",
    features: ["Noise cancellation", "30hr battery", "Bluetooth 5.0", "Fast charging"]
  },
  {
    id: "smartwatch-001",
    name: "Smart Watch",
    price: 199.99,
    description: "Fitness tracking and heart monitoring for all ages",
    image: "/products/smartwatch.jpg",
    category: "wearables",
    features: ["Heart rate monitor", "Step counter", "Sleep tracking", "Waterproof", "Suitable for teens and adults"]
  },
  {
    id: "speaker-001",
    name: "Portable Bluetooth Speaker",
    price: 79.99,
    description: "Waterproof speaker with 12hr playback",
    image: "/products/speaker.jpg",
    category: "audio",
    features: ["Waterproof", "12hr playback", "Bluetooth connection", "Compact design"]
  },
  {
    id: "keyboard-001",
    name: "Ergonomic Keyboard",
    price: 89.99,
    description: "Comfortable mechanical keyboard with wrist support",
    image: "/products/keyboard.jpg",
    category: "computer-accessories",
    features: ["Mechanical keys", "Wrist support", "RGB lighting", "Programmable keys"]
  },
  {
    id: "sleeve-001",
    name: "Ultra-thin Laptop Sleeve",
    price: 29.99,
    description: "Water-resistant sleeve available in various sizes",
    image: "/products/laptop-sleeve.jpg",
    category: "computer-accessories",
    features: ["Water-resistant", "Multiple sizes", "Padded interior", "Slim profile"]
  }
];

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// This would typically come from environment variables
let apiKey = "";

// Enhanced system prompt with detailed context about the website and shopping capabilities
const SYSTEM_PROMPT = `You are a helpful shopping assistant for our e-commerce website. 

WEBSITE CONTEXT:
Our website offers a curated selection of tech products with a shopping cart functionality. Visitors can browse products, add them to their cart, and checkout. The site has product pages with detailed information, a navigation menu, and a persistent shopping cart that shows the current items.

CAPABILITIES:
1. You can search and recommend products from our catalog.
2. You can help customers understand product features and compatibility.
3. You can provide information about shipping, returns, and pricing.
4. You can suggest alternatives when products don't meet customer needs.

SHOPPING CART API (conceptual, for your understanding):
- Current cart contents can be viewed by clicking the cart icon
- Products can be added to the cart with quantity options
- Items can be removed from the cart
- Cart totals are automatically calculated including any applicable discounts

PRODUCT RECOMMENDATION GUIDELINES:
- For children under 12: Focus on durable, simple products with parental controls
- For teenagers: Suggest trendy, versatile products with good value
- For adults: Emphasize quality, features, and longevity
- Always consider budget constraints when mentioned
- Cross-sell complementary products when appropriate

PRODUCT CATALOG:
${PRODUCT_CATALOG.map(product => 
  `- ${product.name} ($${product.price}): ${product.description}
   Features: ${product.features?.join(', ')}`
).join('\n')}

COMMUNICATION STYLE:
- Be friendly but professional
- Keep responses concise (1-3 sentences max)
- Ask clarifying questions when needed
- Never make up information about products not in our catalog
- Personalize responses based on the entire conversation history

You are representing our brand, so be courteous and helpful at all times.`;

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const hasApiKey = (): boolean => {
  return apiKey.length > 0;
};

// Load API key from local storage on initialization
export const loadApiKeyFromStorage = () => {
  const savedKey = localStorage.getItem('deepseek_api_key');
  if (savedKey) {
    apiKey = savedKey;
  }
  return apiKey.length > 0;
};

// Initialize API key load when the module is imported
loadApiKeyFromStorage();

/**
 * Search for products that match certain criteria
 * This function simulates a product search functionality
 */
export const searchProducts = (query: string, category?: string): Product[] => {
  const normalizedQuery = query.toLowerCase();
  
  return PRODUCT_CATALOG.filter(product => {
    // Match by category if provided
    if (category && product.category !== category) {
      return false;
    }
    
    // Match by product details
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.features?.some(feature => 
        feature.toLowerCase().includes(normalizedQuery)
      )
    );
  });
};

/**
 * Get product recommendations based on criteria
 * @param age Optional age for age-appropriate recommendations
 * @param category Optional product category
 * @param priceRange Optional price range as [min, max]
 */
export const getRecommendedProducts = (
  age?: number,
  category?: string,
  priceRange?: [number, number]
): Product[] => {
  let filtered = [...PRODUCT_CATALOG];
  
  // Filter by category
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  // Filter by price range
  if (priceRange) {
    const [min, max] = priceRange;
    filtered = filtered.filter(p => p.price >= min && p.price <= max);
  }
  
  // Sort by age appropriateness if age is provided
  if (age !== undefined) {
    if (age < 12) {
      // For children, prioritize simpler products
      filtered.sort((a, b) => {
        // Smartwatch is good for kids with parental features
        if (a.id.includes('smartwatch')) return -1;
        if (b.id.includes('smartwatch')) return 1;
        return 0;
      });
    } else if (age < 18) {
      // For teenagers, prioritize trendy items
      filtered.sort((a, b) => {
        // Smartwatches and headphones are popular with teens
        if (a.id.includes('smartwatch') || a.id.includes('headphones')) return -1;
        if (b.id.includes('smartwatch') || b.id.includes('headphones')) return 1;
        return 0;
      });
    }
    // Adults get the default sorting (no change)
  }
  
  return filtered;
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
    
    // Add complete chat history for context
    chatHistory.forEach(msg => {
      // Convert internal role to DeepSeek API roles
      const apiRole = msg.sender === 'user' ? 'user' : 'assistant';
      
      // Add a prefix to show which role is speaking
      let content = msg.text;
      if (msg.role) {
        // Only add role prefix for agent/visitor messages to provide context
        if (msg.role === 'visitor' || msg.role === 'agent') {
          content = `[${msg.role.toUpperCase()}]: ${msg.text}`;
        }
      }
      
      messages.push({
        role: apiRole,
        content: content
      });
    });

    // Add the new user message if not already in history
    if (!chatHistory.some(msg => msg.text === userMessage && msg.sender === 'user')) {
      messages.push({
        role: 'user',
        content: userMessage
      });
    }

    console.log("Sending messages to DeepSeek:", messages);

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
