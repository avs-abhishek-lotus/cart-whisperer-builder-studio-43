
import React from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Check } from 'lucide-react';
import { type Product } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isAdding } = useCart();
  const isAddingThis = isAdding === product.id;

  return (
    <Card className="product-card h-full flex flex-col">
      <div className="relative w-full pt-[100%] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-muted-foreground line-clamp-2 mb-2 text-sm">
          {product.description}
        </p>
        <p className="font-semibold text-lg text-cart-dark">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={() => addToCart(product)}
          disabled={isAddingThis}
          variant={isAddingThis ? "outline" : "default"}
        >
          {isAddingThis ? (
            <>
              <Check className="mr-2 h-4 w-4 animate-cart-pulse" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
