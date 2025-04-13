
import React, { useState } from 'react';
import { CartProvider } from '@/context/CartContext';
import Navigation from '@/components/Navigation';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import ChatInterface from '@/components/ChatInterface';
import ImageUploader from '@/components/ImageUploader';
import StockPhotoSelector from '@/components/StockPhotoSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

// Sample products data
const sampleProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Premium noise-cancelling headphones with 30-hour battery life and ultra-comfortable design.',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Track your fitness, receive notifications, and more with this stylish smartwatch.',
  },
  {
    id: '3',
    name: 'Premium Sunglasses',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'UV protection with polarized lenses and lightweight, durable frame.',
  },
  {
    id: '4',
    name: 'Running Shoes',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Responsive cushioning and breathable upper make these perfect for any runner.',
  },
];

const Index = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (imageUrl: string) => {
    setNewProduct({ ...newProduct, image: imageUrl });
  };

  const handleSelectStockPhoto = (imageUrl: string) => {
    setNewProduct({ ...newProduct, image: imageUrl });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.image) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields and add an image',
        variant: 'destructive',
      });
      return;
    }
    
    const price = parseFloat(newProduct.price);
    
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price greater than 0',
        variant: 'destructive',
      });
      return;
    }
    
    const product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price,
      description: newProduct.description,
      image: newProduct.image,
    };
    
    setProducts([product, ...products]);
    setNewProduct({
      name: '',
      price: '',
      description: '',
      image: '',
    });
    setIsCreating(false);
    
    toast({
      title: 'Product created',
      description: `${product.name} has been added to your store`,
    });
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow py-8 px-4 container">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4 text-cart-dark">Custom Shopping Experience</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build your own online store by adding products with custom images or stock photos.
            </p>
          </div>
          
          <div className="mb-8">
            {isCreating ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>
                    Create a new product to display in your store
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateProduct}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input 
                        id="name" 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Wireless Headphones"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="149.99"
                        type="number"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Premium noise-cancelling headphones with 30-hour battery life..."
                        className="min-h-24"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Product Image</Label>
                      <Tabs defaultValue="upload">
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="upload">Upload Image</TabsTrigger>
                          <TabsTrigger value="stock">Stock Photos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload">
                          <ImageUploader onImageUpload={handleImageUpload} />
                        </TabsContent>
                        <TabsContent value="stock">
                          <StockPhotoSelector onSelectImage={handleSelectStockPhoto} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreating(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Product</Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Products</h2>
                <Button onClick={() => setIsCreating(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </div>
            )}
          </div>
          
          {!isCreating && (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </ScrollArea>
          )}
        </main>
        
        <CartDrawer />
        <ChatInterface />
      </div>
    </CartProvider>
  );
};

export default Index;
