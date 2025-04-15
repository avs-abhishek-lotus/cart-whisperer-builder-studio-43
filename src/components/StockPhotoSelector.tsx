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
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
      thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
      alt: "Smart watch with fitness app",
      photographer: "Unsplash",
      source: "unsplash"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
      alt: "Smart watch on display",
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
      // The correct URL should include the APP_NAME env variable from your Flask app
      const possibleUrls = [
        "https://debianlargeserver-0050-dataapps.laxroute53.com/SimpliaDbVizAiPlus/System/ServerSide/api/search-images",
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
              'Accept': 'application/json'
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
        // If all URLs failed, throw the last error
        throw new Error(errorMessage || "All API endpoints failed");
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      
      // Fall back to mock data
      const mockResults = getMockResults(searchTerm);
      setSearchResults(mockResults);
      
      toast({
        title: "Using sample images",
        description: "Could not connect to image service. Using sample images instead.",
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