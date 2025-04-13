
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface StockPhotoSelectorProps {
  onSelectImage: (imageUrl: string) => void;
}

// Mock stock photo data
const stockPhotos = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    alt: 'Black wristwatch',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    alt: 'Headphones',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    alt: 'Sunglasses',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    alt: 'Red shoes',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    alt: 'Perfume bottle',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    alt: 'Smart watch',
  },
];

const StockPhotoSelector: React.FC<StockPhotoSelectorProps> = ({ onSelectImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const filteredPhotos = stockPhotos.filter(photo => 
    photo.alt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectImage = (photo: { id: string; url: string }) => {
    setSelectedImageId(photo.id);
    onSelectImage(photo.url);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search stock photos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredPhotos.map((photo) => (
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
              />
            </div>
          </Card>
        ))}
      </div>
      
      {filteredPhotos.length === 0 && (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No matching photos found</p>
        </div>
      )}
    </div>
  );
};

export default StockPhotoSelector;
