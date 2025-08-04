
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Link to="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order Number:</span>
                <p className="text-gray-600">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <span className="font-medium">Order Date:</span>
                <p className="text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium">Total:</span>
                <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-green-600 capitalize">{order.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                  <img
                    src={item.products.image_url || `https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=80&h=80&fit=crop`}
                    alt={item.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.products.name}</h3>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-600">We're preparing your order for shipment.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-gray-600">You'll receive a tracking number once your order ships.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/products" className="flex-1">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
          <Link to="/profile" className="flex-1">
            <Button variant="outline" className="w-full">View Order History</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
