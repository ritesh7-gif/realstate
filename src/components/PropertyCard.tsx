import React from 'react';
import { Property } from '../types';
import { MapPin, Maximize, Heart, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PropertyCardProps {
  key?: React.Key;
  property: Property;
  onViewDetails: () => void;
  showActions?: boolean;
  onInterest?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function PropertyCard({ property, onViewDetails, showActions = false, onInterest, onSave, isSaved = false }: PropertyCardProps) {
  
  // Create a realistic Unsplash image URL based on the property type
  const getImageUrl = () => {
    const term = encodeURIComponent(property.type.toLowerCase() + " modern luxury architecture exterior");
    // Since unsplash source API is deprecated, we can use a random real photo from Unsplash based on keywords, 
    // or just a static list. Using a seeded dice bear or placeholder is an option, but for 'luxury' we use 
    // unsplash source with a random seed fallback or specific IDs.
    const seeds = [
      "1600596542815-ffad4c1539a9",
      "1512917774080-9991f1c4c750",
      "1613490908814-c48ccbb25141",
      "1600607688969-a5bfcd646154"
    ];
    // Hash property ID to get a stable index
    const index = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % seeds.length;
    return property.imageUrl || `https://images.unsplash.com/photo-${seeds[index]}?auto=format&fit=crop&q=80&w=800`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer`} onClick={onViewDetails}>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={getImageUrl()} 
          alt={property.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-gray-900 shadow-sm flex items-center gap-1.5">
          {property.type}
          {(property.isVerified ?? true) && (
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-royal-blue)]" />
          )}
        </div>
        {showActions && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSave?.(); }}
            className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full shadow-sm transition-colors ${isSaved ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'}`}
          >
            <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      
      <div className="p-5 flex flex-col grow">
        <h3 className="font-medium tracking-tight text-gray-900 text-lg mb-1 truncate">{property.name}</h3>
        <p className="text-gray-500 text-sm font-light flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>

        {/* Property Features Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
           {typeof property.investmentScore !== 'undefined' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] sm:text-[11px] font-semibold tracking-wide border border-green-200">
                 Score: {property.investmentScore}/10
              </span>
           ) : null}
           {property.isRoadTouch ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] sm:text-[11px] font-semibold tracking-wide border border-blue-200">
                <CheckCircle2 className="w-3 h-3" /> Road Touch
              </span>
           ) : null}
           {property.isPmrdaApproved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] sm:text-[11px] font-semibold tracking-wide border border-purple-200">
                <CheckCircle2 className="w-3 h-3" /> PMRDA Approved
              </span>
           ) : null}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-xs text-gray-400 font-light mb-0.5">Guide Price</p>
            <p className="font-semibold text-gray-900">{property.price}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-light mb-0.5">Area</p>
            <p className="font-medium text-gray-600 text-sm flex items-center justify-end gap-1">
              <Maximize className="w-3.5 h-3.5" />
              {property.area}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
            <button 
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
              className="flex-1 py-2 text-sm font-medium text-white bg-[var(--color-royal-blue)] hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
