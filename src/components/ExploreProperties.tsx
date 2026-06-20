import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, ArrowLeft } from 'lucide-react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import PropertyDetails from './PropertyDetails';

const ALL_PROPERTIES: Property[] = [
  {
    id: "f1",
    name: "Crown Forest Villas",
    type: "Luxury Villa",
    location: "Khandala, Maharashtra",
    price: "₹15.5 Cr",
    area: "8,500 sq ft",
    shortDescription: "Ultra-luxury villas nested in Khandala forests overlooking the valley.",
    longDescription: "Crown Forest Villas bring you an unmatched experience of living in harmony with nature without compromising on world-class amenities. Complete with private pools, home theaters, and landscaped gardens.",
    features: ["Private Pool", "Home Theater", "Forest View", "Smart Home"],
    imageUrl: "https://images.unsplash.com/photo-1613490901237-8ddb1dd79691?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["High capital appreciation", "Exclusive community", "Premium rentals"]
  },
  {
    id: "f2",
    name: "Horizon Commercial Tower",
    type: "Commercial Office",
    location: "Kharadi, Pune",
    price: "From ₹5 Cr",
    area: "2,000 - 15,000 sq ft",
    shortDescription: "Grade-A IT office spaces in the heart of Pune's commercial hub.",
    longDescription: "Horizon Tower features LEED-certified sustainable architecture, column-less floor plates, high-speed elevators, and a central location to attract top talent.",
    features: ["LEED Certified", "Central AC", "Cafeteria", "Ample Parking"],
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["Pre-leased options available", "8-10% rental yield expected", "Prime IT corridor"]
  },
  {
    id: "f3",
    name: "Verdant Farm Plots",
    type: "Farm Land",
    location: "Mulshi, Pune",
    price: "From ₹1.2 Cr",
    area: "1 Acre+",
    shortDescription: "Scenic farm plots by the Mulshi lake, perfect for a second home.",
    longDescription: "Build your dream organic farm or a weekend getaway home at Verdant Farm Plots. Includes basic infrastructure like internal roads, water connection, and electricity to the plot.",
    features: ["Lake View", "Road Access", "Water Connection", "Fenced"],
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["Rapid development in Mulshi", "Tourism potential", "Organic farming ready"]
  },
  {
    id: "f4",
    name: "Skyline Penthouses",
    type: "Luxury Apartment",
    location: "Worli, Mumbai",
    price: "₹30 Cr",
    area: "4,500 sq ft",
    shortDescription: "Opulent penthouses with panoramic views of the Arabian Sea.",
    longDescription: "Experience the pinnacle of luxury living. These penthouses feature floor-to-ceiling windows, private elevators, and bespoke interiors with unobstructed ocean views.",
    features: ["Sea View", "Private Elevator", "Concierge Service", "Rooftop Pool"],
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["Trophy asset", "Highly sought-after location", "Stable long-term value"]
  },
  {
    id: "f5",
    name: "Azure Logistics Park",
    type: "Industrial",
    location: "Chakan, Pune",
    price: "₹12 Cr",
    area: "50,000 sq ft",
    shortDescription: "Modern warehousing and logistics spaces with excellent connectivity.",
    longDescription: "Located in the prime industrial belt, Azure Logistics Park offers plug-and-play facilities, high ceilings, docking stations, and heavy vehicle access.",
    features: ["High Clearance", "Docking Bays", "24/7 Security", "Heavy Power"],
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["High demand from e-commerce", "Long-term lease potential", "Strategic industrial node"]
  },
  {
    id: "f6",
    name: "Serenity Plotted Development",
    type: "Investment Plot",
    location: "Hinjewadi Phase 3, Pune",
    price: "₹80 Lakhs",
    area: "2,000 sq ft",
    shortDescription: "Premium villa plots in a rapidly developing tech corridor.",
    longDescription: "Secure your future with these clear-title premium plots located just minutes away from major IT parks. Perfect for building a custom home or holding for appreciation.",
    features: ["Gated Community", "Clubhouse", "Underground Utilities", "Parks"],
    imageUrl: "https://images.unsplash.com/photo-1534430480872-3498384e54e5?auto=format&fit=crop&q=80&w=800",
    investmentHighlights: ["Proximity to IT hubs", "High appreciation rate", "Ready infrastructure"]
  }
];

interface ExplorePropertiesProps {
  onInterest: (val: any) => void;
  onBackToChat?: () => void;
  savedPropertyIds?: string[];
  onSaveProperty?: (id: string) => void;
  showOnlySaved?: boolean;
}

export default function ExploreProperties({ onInterest, onBackToChat, savedPropertyIds = [], onSaveProperty, showOnlySaved = false }: ExplorePropertiesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [city, setCity] = useState("All");
  const [budget, setBudget] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const getPriceValue = (priceStr: string) => {
    // Basic parser for "₹15.5 Cr" or "From ₹5 Cr" or "₹80 Lakhs"
    const isCr = priceStr.toLowerCase().includes('cr');
    const isLakh = priceStr.toLowerCase().includes('lakh');
    const numMatch = priceStr.match(/(\d+(\.\d+)?)/);
    if (!numMatch) return 0;
    
    let val = parseFloat(numMatch[1]);
    if (isCr) val = val * 10000000;
    else if (isLakh) val = val * 100000;
    return val;
  };

  const filteredProperties = useMemo(() => {
    let results = ALL_PROPERTIES.filter((prop) => {
      if (showOnlySaved && !savedPropertyIds.includes(prop.id)) {
        return false;
      }
      
      const matchQuery = searchQuery.toLowerCase();
      const matchesSearch = matchQuery === "" || 
                            prop.name.toLowerCase().includes(matchQuery) || 
                            prop.location.toLowerCase().includes(matchQuery) ||
                            prop.type.toLowerCase().includes(matchQuery);
      
      const matchesType = propertyType === "All" || prop.type === propertyType;
      
      const formattedCity = prop.location.split(', ').pop() || prop.location;
      const matchesCity = city === "All" || formattedCity.trim() === city.trim();
      
      let matchesBudget = true;
      if (budget !== "All") {
        const val = getPriceValue(prop.price);
        if (budget === "Under 1 Cr") matchesBudget = val < 10000000;
        else if (budget === "1 Cr - 5 Cr") matchesBudget = val >= 10000000 && val <= 50000000;
        else if (budget === "5 Cr - 10 Cr") matchesBudget = val > 50000000 && val <= 100000000;
        else if (budget === "Above 10 Cr") matchesBudget = val > 100000000;
      }
      
      return matchesSearch && matchesType && matchesCity && matchesBudget;
    });

    results.sort((a, b) => {
       if (sortBy === "Price: Low to High") return getPriceValue(a.price) - getPriceValue(b.price);
       if (sortBy === "Price: High to Low") return getPriceValue(b.price) - getPriceValue(a.price);
       // Newest - just mock sort by id descending for now
       return b.id.localeCompare(a.id);
    });

    return results;
  }, [searchQuery, propertyType, city, budget, sortBy]);

  const uniqueCities = ["All", ...Array.from(new Set(ALL_PROPERTIES.map(p => (p.location.split(', ').pop() || p.location).trim())))];
  const uniqueTypes = ["All", "Luxury Villa", "Commercial Office", "Farm Land", "Luxury Apartment", "Industrial", "Investment Plot"];
  const budgetOptions = ["All", "Under 1 Cr", "1 Cr - 5 Cr", "5 Cr - 10 Cr", "Above 10 Cr"];
  const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

  return (
    <div className="flex-1 flex flex-col h-full w-full relative bg-transparent overflow-y-auto scroll-smooth">
      {onBackToChat && !selectedProperty && (
        <div className="sticky top-4 left-4 md:top-6 md:left-6 z-50 w-max group">
          <button 
            onClick={onBackToChat}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:bg-white transition-all duration-300 border border-white/60"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Chat</span>
          </button>
        </div>
      )}
        {!selectedProperty ? (
          <div
            key="list"
            className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 flex flex-col"
          >
            {/* Header Options */}
            <div className="flex flex-col mb-12 gap-6 pt-12 md:pt-0">
              <div 
                className="text-center md:text-left flex flex-col items-center md:items-start"
              >
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-3">
                  Explore Properties
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl">
                  Browse all available verified properties.
                </p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative z-20 w-full md:w-96 lg:w-[480px] self-center md:self-start"
              >
                <div className="relative w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-base">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search by city, locality or property name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-gray-900 pl-14 pr-5 py-4 outline-none placeholder:text-gray-500 rounded-full"
                  />
                </div>
              </motion.div>
            </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((prop, idx) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
              >
                <PropertyCard 
                  property={prop} 
                  onViewDetails={() => setSelectedProperty(prop)} 
                  showActions={true}
                  isSaved={savedPropertyIds.includes(prop.id)}
                  onInterest={() => {
                    const saved = localStorage.getItem('userProfile');
                    const profile = saved ? JSON.parse(saved) : null;
                    const contactDetails = profile ? `Name: ${profile.firstName} ${profile.lastName}, Email: ${profile.email}, Phone: ${profile.phone}. Please contact me with more information.` : "Please contact me with more information.";
                    onInterest({ name: prop.name, details: contactDetails });
                  }}
                  onSave={() => onSaveProperty?.(prop.id)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setSearchQuery(""); setCity("All"); setPropertyType("All"); }}
                className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
          </div>
        ) : (
          <div
            className="w-full flex-1 flex flex-col h-full bg-white relative z-10"
          >
            <PropertyDetails 
              property={selectedProperty} 
              onClose={() => setSelectedProperty(null)} 
              onInterest={onInterest}
              isSaved={selectedProperty ? savedPropertyIds.includes(selectedProperty.id) : false}
              onSave={() => selectedProperty && onSaveProperty && onSaveProperty(selectedProperty.id)}
            />
          </div>
        )}
    </div>
  );
}
