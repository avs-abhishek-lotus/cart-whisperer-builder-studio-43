
import React from 'react';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const { toggleCart, totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-cart hover:text-cart-hover transition-colors">
              CartWhisperer
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-cart transition-colors">Home</Link>
            <Link to="/" className="text-gray-700 hover:text-cart transition-colors">Products</Link>
            <Link to="/" className="text-gray-700 hover:text-cart transition-colors">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-cart transition-colors">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              onClick={toggleCart} 
              variant="outline" 
              className="relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-cart text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-cart-pulse">
                  {totalItems}
                </span>
              )}
            </Button>

            <div className="md:hidden">
              <Button variant="ghost" onClick={toggleMenu} size="icon">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-cart transition-colors">Home</Link>
              <Link to="/" className="text-gray-700 hover:text-cart transition-colors">Products</Link>
              <Link to="/" className="text-gray-700 hover:text-cart transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-cart transition-colors">Contact</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
