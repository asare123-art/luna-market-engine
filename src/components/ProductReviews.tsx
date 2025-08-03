
import React, { useState, useEffect } from 'react';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { StarRating } from '@/components/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProductReviewsProps {
  productId: string;
  productRating: number;
  reviewCount: number;
}

interface UserReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
}

export const ProductReviews = ({ productId, productRating, reviewCount }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      checkUserReview();
    }
  }, [user, productId, refreshTrigger]);

  const checkUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, title, comment')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user review:', error);
        return;
      }

      setUserReview(data);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowReviewForm(false);
    checkUserReview();
  };

  const handleEditReview = (review: any) => {
    setUserReview(review);
    setShowReviewForm(true);
  };

  const getRatingDistribution = () => {
    // This would typically come from the database
    // For now, we'll show a simple breakdown
    return [
      { stars: 5, count: Math.floor(reviewCount * 0.6) },
      { stars: 4, count: Math.floor(reviewCount * 0.25) },
      { stars: 3, count: Math.floor(reviewCount * 0.1) },
      { stars: 2, count: Math.floor(reviewCount * 0.03) },
      { stars: 1, count: Math.floor(reviewCount * 0.02) },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{productRating.toFixed(1)}</div>
              <StarRating rating={productRating} size="lg" />
              <p className="text-gray-600 mt-2">Based on {reviewCount} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {getRatingDistribution().map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-sm w-6">{item.stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${reviewCount > 0 ? (item.count / reviewCount) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Review Form */}
      {user && (
        <div>
          {!showReviewForm ? (
            <div className="text-center">
              <Button onClick={() => setShowReviewForm(true)}>
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </Button>
            </div>
          ) : (
            <div>
              <ReviewForm
                productId={productId}
                onReviewSubmitted={handleReviewSubmitted}
                existingReview={userReview || undefined}
              />
              <Button 
                variant="ghost" 
                onClick={() => setShowReviewForm(false)}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Reviews List */}
      <ReviewsList
        productId={productId}
        onEditReview={handleEditReview}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};
