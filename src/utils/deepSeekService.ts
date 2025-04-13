import { toast } from "@/hooks/use-toast";
import { CartAPI } from "@/context/CartContext";

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

// Database initialization status
let isInitialized = false;

// Enhanced system prompt with detailed context about the website and shopping capabilities
const SYSTEM_PROMPT = `You are a helpful shopping assistant for our e-commerce website. 

WEBSITE CONTEXT:
Our website offers a curated selection of tech products with a shopping cart functionality. Visitors can browse products, add them to their cart, and checkout. The site has product pages with detailed information, a navigation menu, and a persistent shopping cart that shows the current items.

PRODUCT DATABASE CAPABILITIES:
You have access to query our product database using the following functions:
1. searchProducts(query, category) - Search products by text query and optional category
2. getRecommendedProducts(age, category, priceRange) - Get products filtered by age appropriateness, category, and price range

SHOPPING CART API:
The following shopping cart functions are available through our CartAPI:
- getCartItems() - Returns an array of all items currently in the cart
- getCartTotal() - Returns the total price of all items in the cart
- getCartItemCount() - Returns the total number of items in the cart
- addProductToCart(product) - Adds a product to the cart
- removeProductFromCart(productId) - Removes a product from the cart
- updateProductQuantity(productId, quantity) - Updates the quantity of a product in the cart
- clearAllItems() - Removes all items from the cart
- getProductById(productId) - Returns a specific product from the cart by ID

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

EXPECTED QUERY PATTERNS:
When I mention "my daughter is 10 years old and needs something for school", you should:
1. Identify the age group (child under 12)
2. Consider the use case (school)
3. Query the product database with appropriate parameters
4. Make suitable recommendations based on results

Your responses should mention specific products from our catalog that match the query parameters.

CART AWARENESS:
When a user asks about their cart or for recommendations, you should check the current cart contents using getCartItems() and consider what's already in the cart for your recommendations.

COMMUNICATION STYLE:
- Be friendly but professional
- Keep responses concise (1-3 sentences max)
- Ask clarifying questions when needed
- Never make up information about products not in our catalog
- Personalize responses based on the entire conversation history

You are representing our brand, so be courteous and helpful at all times.`;

// Function calling definitions for DeepSeek
const FUNCTION_DEFINITIONS = [
  {
    name: "searchProducts",
    description: "Search for products that match certain criteria or keywords",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query or keywords to find relevant products"
        },
        category: {
          type: "string",
          description: "Optional product category to filter results (e.g., 'audio', 'wearables', 'computer-accessories')",
          enum: ["audio", "wearables", "computer-accessories"]
        }
      },
      required: ["query"]
    }
  },
  {
    name: "getRecommendedProducts",
    description: "Get product recommendations based on age, category, and price range",
    parameters: {
      type: "object",
      properties: {
        age: {
          type: "number",
          description: "Age of the person to recommend products for (helps determine age-appropriate items)"
        },
        category: {
          type: "string",
          description: "Product category to filter recommendations",
          enum: ["audio", "wearables", "computer-accessories"]
        },
        priceRange: {
          type: "array",
          description: "Min and max price range for recommendations in the format [min, max]",
          items: {
            type: "number"
          },
          minItems: 2,
          maxItems: 2
        }
      }
    }
  },
  {
    name: "getCartContents",
    description: "Retrieve information about items currently in the shopping cart",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];

export const setApiKey = (key: string) => {
  apiKey = key;
  // Re-initialize connection when API key changes
  isInitialized = false;
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

// Initialize connection to DeepSeek with product database context
export const initializeDeepSeekConnection = async (): Promise<boolean> => {
  if (!apiKey) {
    console.error("Cannot initialize DeepSeek: No API key provided");
    return false;
  }

  if (isInitialized) {
    console.log("DeepSeek connection already initialized");
    return true;
  }

  try {
    // Ping DeepSeek API to verify connection
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: 'Connection test' },
          { role: 'user', content: 'Verify connection' }
        ],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek initialization error:", errorData);
      throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    console.log("DeepSeek connection initialized successfully");
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize DeepSeek connection:", error);
    toast({
      title: "Connection Error",
      description: "Failed to initialize DeepSeek. Please check your API key.",
      variant: "destructive",
    });
    return false;
  }
};

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

/**
 * Get the current cart state to include in DeepSeek prompts
 * @returns A description of the current cart state
 */
export const getCartState = (): string => {
  try {
    const cartItems = CartAPI.getCartItems();
    const cartTotal = CartAPI.getCartTotal();
    const itemCount = CartAPI.getCartItemCount();
    
    if (cartItems.length === 0) {
      return "The shopping cart is currently empty.";
    }
    
    const itemsDescription = cartItems.map(item => 
      `- ${item.name} (Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)})`
    ).join('\n');
    
    return `Current shopping cart contains ${itemCount} item(s) with a total of $${cartTotal.toFixed(2)}:\n${itemsDescription}`;
  } catch (error) {
    console.error("Error getting cart state:", error);
    return "Unable to access shopping cart information.";
  }
};

/**
 * Execute a function called by DeepSeek
 * @param functionName The name of the function to call
 * @param args The arguments to pass to the function
 * @returns The result of the function call
 */
export const executeFunction = async (functionName: string, args: any): Promise<any> => {
  console.log(`Executing function: ${functionName} with args:`, args);
  
  switch (functionName) {
    case 'searchProducts':
      return searchProducts(args.query, args.category);
      
    case 'getRecommendedProducts':
      return getRecommendedProducts(
        args.age, 
        args.category, 
        args.priceRange
      );
      
    case 'getCartContents':
      return CartAPI.getCartItems();
      
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
};

/**
 * Format function results for DeepSeek
 * @param results The results to format
 * @returns Formatted results as a string
 */
export const formatFunctionResults = (functionName: string, results: any): string => {
  if (!results || (Array.isArray(results) && results.length === 0)) {
    return "No results found.";
  }
  
  if (functionName === 'searchProducts' || functionName === 'getRecommendedProducts') {
    return results.map((product: Product) => 
      `Product: ${product.name}\nPrice: $${product.price}\nDescription: ${product.description}\nCategory: ${product.category}\nFeatures: ${product.features?.join(', ')}`
    ).join('\n\n');
  }
  
  if (functionName === 'getCartContents') {
    if (results.length === 0) {
      return "The shopping cart is currently empty.";
    }
    
    return `Cart contains ${results.length} items:\n${results.map((item: any) => 
      `- ${item.name} (Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)})`
    ).join('\n')}`;
  }
  
  return JSON.stringify(results, null, 2);
};

/**
 * Run a product query against the database and format the results for DeepSeek
 * @param queryText The natural language query text
 */
export const runProductQuery = async (queryText: string): Promise<string> => {
  // Initialize connection if not already done
  if (!isInitialized) {
    const success = await initializeDeepSeekConnection();
    if (!success) {
      return "Failed to connect to product database. Please try again later.";
    }
  }

  try {
    // Extract age information if present using simple pattern matching
    const ageMatch = queryText.match(/(\d+)\s*(year|years|yr|yrs)?\s*(old)?/i);
    const age = ageMatch ? parseInt(ageMatch[1]) : undefined;
    
    // Extract category information if present
    const categoryKeywords: {[key: string]: string} = {
      'headphone': 'audio',
      'speaker': 'audio', 
      'music': 'audio',
      'sound': 'audio',
      'watch': 'wearables',
      'fitness': 'wearables',
      'keyboard': 'computer-accessories',
      'laptop': 'computer-accessories',
      'computer': 'computer-accessories',
    };
    
    let category: string | undefined;
    Object.entries(categoryKeywords).forEach(([keyword, cat]) => {
      if (queryText.toLowerCase().includes(keyword)) {
        category = cat;
      }
    });
    
    // Extract price range if present
    const priceMatch = queryText.match(/(\d+)\s*-\s*(\d+)/);
    const priceRange = priceMatch ? [parseInt(priceMatch[1]), parseInt(priceMatch[2])] as [number, number] : undefined;
    
    // Search for products based on the full query text
    const searchResults = searchProducts(queryText, category);
    
    // Get recommended products based on age, category, and price range
    const recommendedProducts = getRecommendedProducts(age, category, priceRange);
    
    // Combine results, prioritizing search results but ensuring we have recommendations
    const combinedResults = [...new Set([...searchResults, ...recommendedProducts])].slice(0, 3);
    
    if (combinedResults.length === 0) {
      return "No products found matching your criteria. Would you like to see our most popular items instead?";
    }
    
    // Get current cart information
    const cartState = getCartState();
    
    // Format results for DeepSeek, including cart information
    const resultsText = combinedResults.map(product => 
      `Product: ${product.name}\nPrice: $${product.price}\nDescription: ${product.description}\nFeatures: ${product.features?.join(', ')}\n`
    ).join('\n');
    
    return `Based on your query, I've found these products in our database:\n\n${resultsText}\n\n${cartState}\n\nWould you like more details about any of these products?`;
  } catch (error) {
    console.error("Error running product query:", error);
    return "I encountered an error while searching our product database. Please try a different query.";
  }
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

  // Initialize connection if not already done
  if (!isInitialized) {
    await initializeDeepSeekConnection();
  }

  try {
    // Run product query to enhance response with product data if message contains product-related keywords
    const productKeywords = ['product', 'recommend', 'buy', 'purchase', 'looking for', 'need', 'want', 'price', 'cost'];
    const containsProductQuery = productKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    
    let productQueryResult = "";
    if (containsProductQuery) {
      productQueryResult = await runProductQuery(userMessage);
      console.log("Product query result:", productQueryResult);
    }
    
    // Get current cart state for context
    const cartState = getCartState();
    
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
    
    // If we have product query results, add them as additional context
    if (productQueryResult) {
      messages.push({
        role: 'system',
        content: `PRODUCT SEARCH RESULTS: ${productQueryResult}`
      });
    }
    
    // Add cart state as context
    messages.push({
      role: 'system',
      content: `CART STATE: ${cartState}`
    });

    console.log("Sending messages to DeepSeek:", messages);

    // Setup request body with function calling
    const requestBody: any = {
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      tools: FUNCTION_DEFINITIONS
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Check if DeepSeek wants to call a function
    if (data.choices[0]?.message?.tool_calls && data.choices[0].message.tool_calls.length > 0) {
      console.log("DeepSeek wants to call functions:", data.choices[0].message.tool_calls);
      
      // Process each function call
      const toolCalls = data.choices[0].message.tool_calls;
      const functionResults = [];
      
      for (const toolCall of toolCalls) {
        try {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          
          // Execute the function
          const result = await executeFunction(functionName, args);
          
          // Format the results
          const formattedResult = formatFunctionResults(functionName, result);
          
          functionResults.push({
            tool_call_id: toolCall.id,
            function_name: functionName,
            result: formattedResult
          });
        } catch (error) {
          console.error("Error executing function:", error);
          functionResults.push({
            tool_call_id: toolCall.id,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
      
      // Continue the conversation with function results
      if (functionResults.length > 0) {
        console.log("Function results:", functionResults);
        
        // Add the assistant message with function calls
        messages.push(data.choices[0].message);
        
        // Add the function results
        for (const result of functionResults) {
          messages.push({
            role: 'tool',
            tool_call_id: result.tool_call_id,
            content: typeof result.result === 'string' ? result.result : JSON.stringify(result.result)
          });
        }
        
        // Make a follow-up request to get DeepSeek's response with function results
        const followUpResponse = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages,
            temperature: 0.7,
            max_tokens: 1000
          }),
        });
        
        if (!followUpResponse.ok) {
          const errorData = await followUpResponse.json();
          console.error("DeepSeek follow-up API error:", errorData);
          throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const followUpData = await followUpResponse.json();
        return followUpData.choices[0]?.message?.content || "I couldn't generate a response with function results.";
      }
    }
    
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
