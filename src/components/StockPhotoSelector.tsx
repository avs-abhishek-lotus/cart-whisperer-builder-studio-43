
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          count: 72
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.images);
    } catch (err) {
      setError('Failed to fetch images. Please try again.');
      toast({
        title: "Error",
        description: "Failed to fetch images. Please try again.",
        variant: "destructive",
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
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No images found. Try a different search term.' : 'Search for images to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockPhotoSelector;
