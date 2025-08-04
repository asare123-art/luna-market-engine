
import React, { useEffect, useState } from 'react';
import { ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  user_id: string;
}

interface ReviewsListProps {
  productId: string;
  onEditReview: (review: Review) => void;
  refreshTrigger?: number;
}

export const ReviewsList = ({ productId, onEditReview, refreshTrigger }: ReviewsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadReviews();
    if (user) {
      loadHelpfulVotes();
    }
  }, [productId, user, refreshTrigger]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHelpfulVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('review_helpful')
        .select('review_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const votesMap: Record<string, boolean> = {};
      data?.forEach(vote => {
        votesMap[vote.review_id] = true;
      });
      setHelpfulVotes(votesMap);
    } catch (error) {
      console.error('Error loading helpful votes:', error);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyHelpful = helpfulVotes[reviewId];

      if (isCurrentlyHelpful) {
        // Remove helpful vote
        const { error } = await supabase
          .from('review_helpful')
          .delete()
          .eq('user_id', user.id)
          .eq('review_id', reviewId);

        if (error) throw error;

        setHelpfulVotes(prev => ({ ...prev, [reviewId]: false }));
      } else {
        // Add helpful vote
        const { error } = await supabase
          .from('review_helpful')
          .insert({
            user_id: user.id,
            review_id: reviewId
          });

        if (error) throw error;

        setHelpfulVotes(prev => ({ ...prev, [reviewId]: true }));
      }

      // Refresh reviews to get updated helpful counts
      loadReviews();
    } catch (error) {
      console.error('Error voting helpful:', error);
      toast({
        title: "Error",
        description: "Failed to update vote",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been deleted",
      });

      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Reviews ({reviews.length})</h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    U
                  </div>
                  <div>
                    <p className="font-medium">Anonymous User</p>
                    <p className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {user?.id === review.user_id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditReview(review)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <StarRating rating={review.rating} />
                {review.title && (
                  <h4 className="font-medium mt-2">{review.title}</h4>
                )}
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-3">{review.comment}</p>
              )}

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleHelpfulVote(review.id)}
                  className={helpfulVotes[review.id] ? 'text-blue-600' : ''}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful_count})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
