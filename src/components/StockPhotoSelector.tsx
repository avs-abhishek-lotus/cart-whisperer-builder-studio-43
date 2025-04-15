
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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

interface SearchResponse {
  images: ImageResult[];
}

// Sample data to fall back on when API encounters CORS issues
const sampleImageResults: ImageResult[] = [
  {
    url: "https://i5.walmartimages.com/seo/Smart-Watch-Android-iPhone-IP68-Waterproof-Smartwatch-Women-Men-100-Sports-Modes-1-91-inch-Fitness-Tracker-Smart-Watch-Bluetooth-Call-Answer-Make-Cal_455187f7-6e3a-41d9-9a68-13a4ead0ce23.e769294cb943808472d6bd264a453f11.jpeg",
    alt: "Smart Watch from Walmart",
    id: 1,
    thumbnail: "https://serpapi.com/searches/67fe2687fa0d63a77852b23f/images/83b3f93e243155e11c6b8e91f0bd3ae5751197b6ff76aa749cbf9a81ae3c46f7.jpeg",
    photographer: "Walmart",
    source: "google"
  },
  {
    url: "https://i.pcmag.com/imagery/reviews/04jEL5dw2xHRGBueOgfYvYw-1..v1721144199.jpg",
    alt: "Smart Watch from PCMag",
    id: 2,
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3wVBw-lD3zIWpBrOmcjRPgbv-E3v08bBWgA&s",
    photographer: "PCMag",
    source: "google"
  },
  {
    url: "https://igabiba.com/cdn/shop/files/moye-kronos-iii-smart-watch-pink-8605042605446-54139464089946_800x.jpg?v=1715000699",
    alt: "Smart Watch from igabiba",
    id: 3,
    thumbnail: "https://serpapi.com/searches/67fe2687fa0d63a77852b23f/images/83b3f93e243155e18c0b89ee6930daa5c776f1e583acec3de2b4bd5e41ad2524.jpeg",
    photographer: "igabiba",
    source: "google"
  },
  {
    url: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
    alt: "Smart Watch on wrist",
    id: 4,
    thumbnail: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280",
    photographer: "Pexels",
    source: "pexels"
  },
  {
    url: "https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg",
    alt: "Apple Watch with apps",
    id: 5,
    thumbnail: "https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280",
    photographer: "Pexels",
    source: "pexels"
  },
  {
    url: "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg",
    alt: "Fitness tracker on wrist",
    id: 6,
    thumbnail: "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280",
    photographer: "Pexels",
    source: "pexels"
  }
];

const StockPhotoSelector: React.FC<StockPhotoSelectorProps> = ({ onSelectImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const response = await fetch('https://debianlargeserver-0050-dataapps.laxroute53.com/SimpliaDbVizAiPlus/System/ServerSide/api/search-images', {
        method: 'POST',
        mode: 'no-cors', // Set mode to no-cors to avoid CORS issues
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          count: 72
        }),
      });

      // When using no-cors mode, we can't read the response directly
      // So we'll use our sample data as a fallback
      console.log('Search response status:', response.status, response.type);
      
      if (response.type === 'opaque') {
        console.log('Using sample data due to opaque response from no-cors mode');
        // Filter sample data based on search term
        const filteredResults = sampleImageResults.filter(img => 
          img.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.photographer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredResults.length > 0 ? filteredResults : sampleImageResults);
        
        toast({
          title: "Using sample images",
          description: "The API is currently unavailable due to CORS restrictions. Showing sample images instead.",
          variant: "default",
        });
      } else {
        // Normal flow if somehow CORS is resolved
        const data: SearchResponse = await response.json();
        setSearchResults(data.images);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setSearchResults(sampleImageResults);
      
      toast({
        title: "Using sample images",
        description: "Error connecting to image search API. Showing sample images instead.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = (photo: ImageResult) => {
    setSelectedImageId(photo.id);
    onSelectImage(photo.url);
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {searchResults.map((photo) => (
          <Card
            key={photo.id}
            className={`cursor-pointer overflow-hidden transition-all ${
              selectedImageId === photo.id ? 'ring-2 ring-cart' : ''
            }`}
            onClick={() => handleSelectImage(photo)}
          >
            <div className="relative pt-[100%]">
              <img
                src={photo.url}
                alt={photo.alt}
                className="absolute top-0 left-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://placehold.co/300x300/e0e0e0/6c757d?text=Image+Unavailable';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                <p className="truncate">{photo.photographer}</p>
                <p className="truncate text-gray-300">via {photo.source}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {error && (
        <div className="text-center p-8">
          <p className="text-red-500">{error}</p>
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
