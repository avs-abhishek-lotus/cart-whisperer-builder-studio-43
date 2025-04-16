import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockPhotoSelectorProps {
  onSelectImage: (imageUrl: string) => void;
}

interface ImageResult {
  url: string;
  alt: string;
  id: number;
  thumbnail: string;
  photographer: string;
  source: string;
}

// Mock data as fallback if API fails
const mockImageData: {[key: string]: ImageResult[]} = {
  "watch": [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
      thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200",
      alt: "Smart watch on wrist",
      photographer: "Unsplash",
      source: "unsplash"
    },
    // ... other watch images
  ],
  "phone": [
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200",
      alt: "Smartphone on table",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc",
      thumbnail: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=200",
      alt: "Person holding smartphone",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ],
  "laptop": [
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200",
      alt: "Macbook on desk",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6",
      thumbnail: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=200",
      alt: "Person working on laptop",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ],
  "headphones": [
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
      alt: "Wireless headphones",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 9,
      url: "https://images.unsplash.com/photo-1484704849700-f032a568e944",
      thumbnail: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200",
      alt: "Headphones on wooden surface",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ],
  "camera": [
    {
      id: 10,
      url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
      thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200",
      alt: "DSLR camera",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 11,
      url: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848",
      thumbnail: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=200",
      alt: "Vintage camera",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ],
  "shoes": [
    {
      id: 12,
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
      thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200",
      alt: "Nike sneakers",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 13,
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
      alt: "Red sneakers",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ],
  "furniture": [
    {
      id: 14,
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
      thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
      alt: "Sofa in living room",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 15,
      url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5",
      thumbnail: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=200",
      alt: "Modern chair",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ],
  // ... other categories as fallback
  "default": [
    {
      id: 19,
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
      alt: "Wireless headphones",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 20,
      url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
      thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200",
      alt: "Smart watch on wrist",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 21,
      url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
      thumbnail: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200",
      alt: "Sunglasses product",
      photographer: "Unsplash",
      source: "unsplash"
    }
  ]
};

// Helper function to search Unsplash directly as fallback
const searchUnsplash = async (query: string, count: number = 10): Promise<ImageResult[]> => {
  try {
    // Use a public Unsplash API (client-only access)
    const unsplashAccessKey = 'B8Wqu2Lb_kTxJE5-OUSvEmZT8SvNQ9uVeD3HOpEe5MQ';
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${unsplashAccessKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map((image: any, index: number) => ({
      id: index,
      url: image.urls.regular,
      thumbnail: image.urls.thumb,
      alt: image.alt_description || `Image of ${query}`,
      photographer: image.user.name,
      source: "unsplash"
    }));
  } catch (err) {
    console.error('Error fetching from Unsplash:', err);
    return [];
  }
};

// Helper function to search Pexels directly as fallback
const searchPexels = async (query: string, count: number = 10): Promise<ImageResult[]> => {
  try {
    // Use a public Pexels API key
    const pexelsApiKey = 'AqtKZB8Gw3O0l9tytz3UN6GNKJ28e8b7f0OiqmRhfvFMjijjjocHlSVP';
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          Authorization: pexelsApiKey
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.photos.map((photo: any, index: number) => ({
      id: 100 + index, // Offset to avoid ID conflicts with Unsplash
      url: photo.src.large,
      thumbnail: photo.src.medium,
      alt: photo.alt || `Image of ${query}`,
      photographer: photo.photographer,
      source: "pexels"
    }));
  } catch (err) {
    console.error('Error fetching from Pexels:', err);
    return [];
  }
};

const StockPhotoSelector: React.FC<StockPhotoSelectorProps> = ({ onSelectImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get mock results as fallback
  const getMockResults = (query: string): ImageResult[] => {
    const lowerQuery = query.toLowerCase();
    for (const key of Object.keys(mockImageData)) {
      if (lowerQuery.includes(key)) {
        return mockImageData[key];
      }
    }
    return mockImageData.default;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a search term to find images",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      // Try multiple API URL patterns
      const possibleUrls = [
        "https://debianlargeserver-0050-dataapps.laxroute53.com/SimpliaDbVizAiPlus/System/ServerSide/api/search-images"
      ];
      
      let response = null;
      let succeeded = false;
      let errorMessage = "";
      
      // Try each URL until one works
      for (const url of possibleUrls) {
        try {
          console.log(`Trying to fetch from: ${url}`);
          
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              mode: 'no-cors',
            },
            body: JSON.stringify({
              query: searchTerm,
              count: 24
            }),
          });
          
          // If we get a successful response, break the loop
          if (response.ok) {
            succeeded = true;
            break;
          } else {
            errorMessage = `HTTP error! Status: ${response.status} for URL: ${url}`;
          }
        } catch (err) {
          errorMessage = `Failed to fetch from ${url}: ${err}`;
          console.error(errorMessage);
          // Continue trying the next URL
        }
      }
      
      if (succeeded && response) {
        const data = await response.json();
        if (data.images && Array.isArray(data.images)) {
          setSearchResults(data.images);
          toast({
            title: "Images found",
            description: `Found ${data.images.length} stock images for "${searchTerm}"`,
          });
        } else {
          throw new Error("Invalid response format from API");
        }
      } else {
        // If backend API fails, try direct API calls to image services
        console.log("All backend APIs failed, trying direct service calls");
        let combinedResults: ImageResult[] = [];
        
        // Try Unsplash directly
        const unsplashResults = await searchUnsplash(searchTerm, 12);
        if (unsplashResults.length > 0) {
          combinedResults = [...combinedResults, ...unsplashResults];
        }
        
        // Try Pexels directly
        const pexelsResults = await searchPexels(searchTerm, 12);
        if (pexelsResults.length > 0) {
          combinedResults = [...combinedResults, ...pexelsResults];
        }
        
        if (combinedResults.length > 0) {
          setSearchResults(combinedResults);
          toast({
            title: "Images found",
            description: `Found ${combinedResults.length} images for "${searchTerm}" from direct sources`,
          });
          return;
        }
        
        // If all direct API calls fail too, use mock data
        throw new Error("All API endpoints failed");
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      
      // Fall back to mock data
      const mockResults = getMockResults(searchTerm);
      setSearchResults(mockResults);
      
      toast({
        title: "Using sample images",
        description: "Could not connect to image services. Using sample images instead.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = (photo: ImageResult) => {
    setSelectedImageId(photo.id);
    onSelectImage(photo.url);
    
    toast({
      title: "Image selected",
      description: "The image has been added to your product",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stock photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="text-center p-4 bg-red-50 rounded border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {/* Display search results */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {searchResults.map((photo) => (
            <div 
              key={photo.id}
              className={`relative cursor-pointer border rounded-md overflow-hidden hover:shadow-md transition-shadow ${selectedImageId === photo.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleSelectImage(photo)}
            >
              <img 
                src={photo.thumbnail || photo.url} 
                alt={photo.alt || "Stock photo"} 
                className="w-full aspect-square object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                {photo.photographer || "Unknown"}
                {photo.source && <span className="opacity-60 ml-1">({photo.source})</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && !error && searchResults.length === 0 && (
        <div className="text-center p-8">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No images found. Try a different search term.' : 'Search for images to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockPhotoSelector;