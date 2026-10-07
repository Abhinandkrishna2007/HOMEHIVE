import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Briefcase, Star, Clock } from 'lucide-react';
import RatingStars from './RatingStars';
import VerifiedBadge from './VerifiedBadge';

const ProviderCard = ({
  provider,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = true,
}) => {
  const navigate = useNavigate();

  const {
    _id,
    businessName,
    category,
    experience,
    rating,
    totalReviews,
    city,
    startingPrice,
    profileImage,
    isApproved,
  } = provider;

  const handleCardClick = () => {
    navigate(`/professionals/${_id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/booking/${_id}`);
  };

  const handleFavClick = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(_id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-3xl border border-gray-100 hover:border-orange-100 shadow-sm hover:shadow-xl transition-all-custom cursor-pointer overflow-hidden group flex flex-col h-full"
    >
      {/* Provider Header Image & Category Tag */}
      <div className="relative h-44 bg-slate-100 overflow-hidden flex-shrink-0">
        <img
          src={profileImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'}
          alt={businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-brand-orange text-[10px] font-black uppercase tracking-wider border border-white shadow-sm">
          {category}
        </div>

        {/* Favorite Heart Button */}
        {showFavoriteButton && (
          <button
            onClick={handleFavClick}
            className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow-sm transition-all-custom bg-white/95 border-white hover:bg-white text-brand-navy hover:text-red-500"
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-red-500 text-red-500 stroke-[2]' : 'text-brand-navy'}
            />
          </button>
        )}
      </div>

      {/* Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Verification */}
          <div className="flex justify-between items-center mb-2">
            <RatingStars rating={rating} size={14} />
            {isApproved && <VerifiedBadge text="Verified" />}
          </div>

          {/* Business Title */}
          <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-orange transition-colors line-clamp-1">
            {businessName}
          </h3>

          {/* Location & Experience details */}
          <div className="flex flex-col gap-1.5 mt-3 text-xs text-brand-muted font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-orange flex-shrink-0" />
              <span className="truncate">{city}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-brand-orange flex-shrink-0" />
              <span>{experience} Yrs Experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-orange flex-shrink-0" />
              <span>Response: ~1 Hour</span>
            </div>
          </div>
        </div>

        {/* Price & Action CTA */}
        <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-50 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-brand-muted uppercase leading-none">Starting from</span>
            <span className="text-base font-black text-brand-navy mt-1">₹{startingPrice || 299}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBookNow}
              className="px-4 py-2 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all-custom shadow-md shadow-brand-navy/10"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
