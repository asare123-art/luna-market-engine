
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const OrderSummary = ({ items, subtotal, shipping, tax, total }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.products.name}</p>
                <p className="text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">
                ${(item.products.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {subtotal < 50 && (
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            💡 Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
