import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';

const ServiceCard = ({ service, showProvider = true, onBook }) => {
  const navigate = useNavigate();
  const { _id, title, description, price, priceType, duration, image, provider } = service;

  const handleBook = () => {
    if (onBook) {
      onBook(_id);
    } else {
      const providerId = provider?._id || provider;
      if (providerId) {
        navigate(`/booking/${providerId}?serviceId=${_id}`);
      }
    }
  };

  const getPriceTypeLabel = (type) => {
    if (type === 'starting') return 'Starting From';
    if (type === 'hourly') return 'Per Hour';
    return 'Fixed Price';
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all-custom flex flex-col md:flex-row gap-5">
      {/* Service Image */}
      <img
        src={image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'}
        alt={title}
        className="w-full md:w-44 h-32 object-cover rounded-2xl flex-shrink-0 bg-slate-50"
      />

      {/* Info details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-base font-bold text-brand-navy leading-snug">{title}</h3>
            {showProvider && provider?.businessName && (
              <span className="text-[10px] font-black text-brand-orange uppercase bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                {provider.businessName}
              </span>
            )}
          </div>
          <p className="text-xs text-brand-muted mt-2 line-clamp-2 leading-relaxed">{description}</p>
        </div>

        {/* Duration & price tags */}
        <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t border-gray-50 gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-brand-navy/60">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-orange" />
              <span>{duration || '1 hr'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={14} className="text-brand-orange" />
              <span>{getPriceTypeLabel(priceType)}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-base font-black text-brand-navy">₹{price}</span>
            <button
              onClick={handleBook}
              className="px-5 py-2 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all-custom shadow-md shadow-brand-navy/10"
            >
              Book Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
