
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  bgColor: string;
  textColor: string;
  buttonText: string;
  link: string;
  icon: React.ReactNode;
  timeLeft?: string;
}

export const PromotionBanner = () => {
  const promotions: Promotion[] = [
    {
      id: "1",
      title: "Summer Sale",
      description: "Get amazing deals on electronics and gadgets",
      discount: "Up to 50% OFF",
      bgColor: "bg-gradient-to-r from-orange-400 to-pink-400",
      textColor: "text-white",
      buttonText: "Shop Now",
      link: "/products?category=electronics",
      icon: <Tag className="h-6 w-6" />,
      timeLeft: "2 days left"
    },
    {
      id: "2",
      title: "New Arrivals",
      description: "Discover the latest products just added to our store",
      discount: "15% OFF",
      bgColor: "bg-gradient-to-r from-blue-500 to-purple-600",
      textColor: "text-white",
      buttonText: "Explore",
      link: "/products?sort=newest",
      icon: <ArrowRight className="h-6 w-6" />
    },
    {
      id: "3",
      title: "Limited Time",
      description: "Flash deals that won't last long",
      discount: "30% OFF",
      bgColor: "bg-gradient-to-r from-green-400 to-blue-500",
      textColor: "text-white",
      buttonText: "Hurry Up",
      link: "/products?sale=flash",
      icon: <Clock className="h-6 w-6" />,
      timeLeft: "6 hours left"
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`${promo.bgColor} ${promo.textColor} rounded-xl p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {promo.icon}
                    <h3 className="text-xl font-bold">{promo.title}</h3>
                  </div>
                  {promo.timeLeft && (
                    <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                      {promo.timeLeft}
                    </span>
                  )}
                </div>
                
                <p className="text-lg font-semibold mb-2">{promo.discount}</p>
                <p className="text-sm mb-4 opacity-90">{promo.description}</p>
                
                <Link to={promo.link}>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    {promo.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
