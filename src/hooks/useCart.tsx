
import { useCart as useCartContext } from '@/context/CartContext';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { Product } from '@/context/CartContext';

export const useCart = () => {
  const cartContext = useCartContext();
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const addToCart = (product: Product) => {
    setIsAdding(product.id);
    
    setTimeout(() => {
      cartContext.addItem(product);
      setIsAdding(null);
      
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
      });
    }, 300);
  };

  const removeFromCart = (id: string, name: string) => {
    cartContext.removeItem(id);
    
    toast({
      title: 'Removed from cart',
      description: `${name} has been removed from your cart`,
      variant: 'destructive',
    });
  };

  const updateItemQuantity = (id: string, quantity: number, name: string) => {
    if (quantity <= 0) {
      cartContext.removeItem(id);
      
      toast({
        title: 'Removed from cart',
        description: `${name} has been removed from your cart`,
        variant: 'destructive',
      });
      
      return;
    }
    
    cartContext.updateQuantity(id, quantity);
  };

  return {
    ...cartContext,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    isAdding,
  };
};
