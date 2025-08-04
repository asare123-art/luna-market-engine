
import { useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    product_id: string;
    products: {
      id: string;
      name: string;
      price: number;
      image_url: string;
      description: string;
    };
  };
  onUpdate: () => void;
}

export const CartItem = ({ item, onUpdate }: CartItemProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem();
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cart updated",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item removed from cart",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <img
            src={item.products.image_url || `https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop`}
            alt={item.products.name}
            className="w-20 h-20 object-cover rounded"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.products.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{item.products.description}</p>
            <p className="text-primary font-semibold mt-1">
              ${item.products.price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.quantity - 1)}
              disabled={loading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(item.quantity + 1)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              ${(item.products.price * item.quantity).toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeItem}
              disabled={loading}
              className="text-red-600 hover:text-red-800 mt-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
