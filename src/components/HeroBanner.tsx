
import { Link } from "react-router-dom";
import { ArrowRight, Play, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    {
      id: 1,
      title: "Welcome to LunaMarket",
      subtitle: "Your Premium Shopping Destination",
      description: "Discover premium products, exceptional quality, and unbeatable service. Your perfect shopping experience starts here.",
      bgImage: "https://images.unsplash.com/photo-1593110279196-457076187815?w=1200&h=600&fit=crop",
      primaryAction: {
        text: "Shop Now",
        link: "/products",
        icon: <ShoppingBag className="h-5 w-5" />
      },
      secondaryAction: {
        text: "Watch Video",
        link: "#",
        icon: <Play className="h-5 w-5" />
      }
    },
    {
      id: 2,
      title: "Premium Electronics",
      subtitle: "Latest Tech at Best Prices",
      description: "Explore cutting-edge gadgets and electronics with warranty and fast shipping worldwide.",
      bgImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=600&fit=crop",
      primaryAction: {
        text: "Browse Electronics",
        link: "/products?category=electronics",
        icon: <ArrowRight className="h-5 w-5" />
      },
      secondaryAction: {
        text: "Learn More",
        link: "/about",
        icon: <Star className="h-5 w-5" />
      }
    },
    {
      id: 3,
      title: "Free Shipping Worldwide",
      subtitle: "No Minimum Order Required",
      description: "Enjoy free shipping on all orders with our premium delivery service and tracking.",
      bgImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&h=600&fit=crop",
      primaryAction: {
        text: "Start Shopping",
        link: "/products",
        icon: <ArrowRight className="h-5 w-5" />
      },
      secondaryAction: {
        text: "Shipping Info",
        link: "/shipping",
        icon: <Star className="h-5 w-5" />
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[500px] md:h-[600px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.bgImage})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <p className="text-lg md:text-xl text-blue-300 mb-2 font-medium">
                  {banner.subtitle}
                </p>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {banner.title}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
                  {banner.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={banner.primaryAction.link}>
                    <Button size="lg" className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700">
                      {banner.primaryAction.icon}
                      <span className="ml-2">{banner.primaryAction.text}</span>
                    </Button>
                  </Link>
                  <Link to={banner.secondaryAction.link}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-gray-900"
                    >
                      {banner.secondaryAction.icon}
                      <span className="ml-2">{banner.secondaryAction.text}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ArrowRight className="h-6 w-6 rotate-180" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ArrowRight className="h-6 w-6" />
      </button>
    </section>
  );
};
