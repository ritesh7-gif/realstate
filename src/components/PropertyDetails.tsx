import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Maximize, CheckCircle2, ShieldCheck, Mail, User, Phone, Calendar, ChevronLeft, ChevronRight, Heart, Share, CalendarDays, ExternalLink, Navigation, Building2, Car, TrendingUp, Star, Trees, Banknote, CarFront } from 'lucide-react';
import { Property } from '../types';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PropertyDetailsProps {
  property: Property | null;
  onClose: () => void;
  onInterest: (data: { name: string, details: string }) => void;
  isSaved?: boolean;
  onSave?: () => void;
}

export default function PropertyDetails({ property, onClose, onInterest, isSaved = false, onSave }: PropertyDetailsProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    const profile = saved ? JSON.parse(saved) : { firstName: '', lastName: '', email: '', phone: '' };
    return {
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      phone: profile.phone || '',
      email: profile.email || '',
      date: ''
    };
  });

  useEffect(() => {
    if (showForm) {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        const profile = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
          phone: profile.phone || '',
          email: profile.email || ''
        }));
      }
    }
  }, [showForm]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageUrl = () => {
    if (!property) return '';
    if (property.imageUrl) return property.imageUrl;
    const seeds = [
      "1600596542815-ffad4c1539a9",
      "1512917774080-9991f1c4c750",
      "1613490908814-c48ccbb25141",
      "1600607688969-a5bfcd646154"
    ];
    const index = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % seeds.length;
    return `https://images.unsplash.com/photo-${seeds[index]}?auto=format&fit=crop&q=80&w=1200`;
  };

  const images = property ? [
    getImageUrl(),
    "https://images.unsplash.com/photo-1600607687931-cebf0746e48e?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&q=80&w=1200"
  ] : [];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setShowForm(false);
    setIsSubmitted(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    onInterest({
      name: property?.name || '',
      details: `Name: ${formData.name}, Email: ${formData.email}, Phone: ${formData.phone}, Preferred Date: ${formData.date}`
    });
  };

  return (
    <>
      {property && (
        <div className="w-full h-full flex flex-col bg-white overflow-y-auto relative">
          {/* Desktop floating back button */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 px-4 py-4 md:px-8 border-b border-gray-100 flex items-center">
            <button 
              onClick={handleClose} 
              className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-full text-gray-900 transition-colors gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              <span className="text-sm font-medium pr-1">Close Details</span>
            </button>
          </div>

          {/* Images Slider */}
          <div className="w-full max-w-7xl mx-auto md:px-8 mt-4 shrink-0 relative">
             <div className="relative h-[30vh] md:h-[40vh] bg-gray-100 md:rounded-3xl overflow-hidden group">
               <img src={images[currentImageIndex]} alt={property.name} className="w-full h-full object-cover transition-opacity duration-300" />
               
               {images.length > 1 && (
                 <>
                   <button 
                     onClick={handlePrevImage}
                     className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-gray-900 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-10"
                   >
                     <ChevronLeft className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={handleNextImage}
                     className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-gray-900 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-10"
                   >
                     <ChevronRight className="w-5 h-5" />
                   </button>
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                     {images.map((_, idx) => (
                       <div 
                         key={idx} 
                         className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                           idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                         }`} 
                       />
                     ))}
                   </div>
                 </>
               )}
             </div>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-10 w-full grow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                      {property.type}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Owner Verified
                    </div>
                  </div>
                  <h2 className="text-3xl font-medium tracking-tight text-gray-900 mb-2">{property.name}</h2>
                  <p className="text-gray-500 font-light flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-sm text-gray-500 font-medium mb-1">Asking Price</p>
                  <p className="text-3xl font-medium tracking-tight text-gray-900">{property.price}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Space</p>
                  <p className="text-3xl font-medium tracking-tight text-gray-900 flex items-center gap-2">
                    <Maximize className="w-6 h-6 text-gray-400" />
                    {property.area}
                  </p>
                </div>
              </div>

              {!showForm ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3 pb-6 border-b border-gray-100">
                     <button onClick={onSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 font-medium text-sm hover:shadow-sm transition ${isSaved ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'text-gray-700 hover:bg-gray-50'}`}>
                       <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? "Saved" : "Save Property"}
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:shadow-sm transition">
                       <Share className="w-4 h-4" /> Share
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:shadow-sm transition" onClick={() => setShowForm(true)}>
                       <CalendarDays className="w-4 h-4 text-blue-500" /> Schedule Visit
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 hover:shadow-md transition">
                       <Phone className="w-4 h-4" /> Contact Owner
                     </button>
                  </div>

                  <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Property Summary</h3>
                    <p className="text-gray-700 font-light leading-relaxed text-[15px]">This roadside plot is located in one of Pune's fastest-growing corridors with excellent connectivity and long-term investment potential. Suitable for both residential development and capital appreciation. {property.longDescription}</p>
                  </section>

                  {property.features && property.features.length > 0 && (
                    <section>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Features & Amenities</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-gray-600 font-light text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Why This Property Stands Out</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Roadside Plot', 'PMRDA Approved', 'Near Future Ring Road', 'Excellent Investment Potential', 'High Growth Corridor', 'Fast Developing Area'].map((item, i) => (
                         <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition shadow-[0_2px_10px_rgb(0,0,0,0.01)] hover:shadow-sm">
                           <div className="bg-green-50 p-1.5 rounded-full shrink-0">
                             <CheckCircle2 className="w-4 h-4 text-green-600" />
                           </div>
                           <span className="text-gray-700 font-medium text-sm">{item}</span>
                         </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Nearby Places</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                       {[ { icon: Building2, label: 'School', dist: '1.2 km' }, { icon: ShieldCheck, label: 'Hospital', dist: '2.5 km' }, { icon: Navigation, label: 'Highway', dist: '0.8 km' }, { icon: Car, label: 'Metro', dist: '4.0 km' }, { icon: Building2, label: 'IT Park', dist: '5.2 km' }, { icon: Star, label: 'Mall', dist: '3.1 km' }, { icon: Trees, label: 'Park', dist: '0.5 km' }, { icon: ExternalLink, label: 'Airport', dist: '18 km' } ].map((place, i) => (
                          <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition text-center group">
                            <place.icon className="w-6 h-6 text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-gray-900 font-medium text-xs mb-0.5">{place.label}</span>
                            <span className="text-gray-500 text-[10px]">{place.dist}</span>
                          </div>
                       ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Location Map
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Navigation className="w-3.5 h-3.5"/> Get Directions</button>
                      </div>
                    </h3>
                    <div className="w-full h-[300px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(property?.location || 'India')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        className="grayscale-[0.2] transition-all duration-500 group-hover:grayscale-0"
                      ></iframe>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm border border-white/50 flex items-center gap-1.5 pointer-events-none">
                        <MapPin className="w-3 h-3" />
                        Approximate Location
                      </div>
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <button className="bg-white px-4 py-2 rounded-xl text-xs font-medium shadow-md border border-gray-100 hover:bg-gray-50 transition flex items-center gap-1.5">
                          <ExternalLink className="w-3 h-3"/> Open in Google Maps
                        </button>
                        <button className="bg-white px-4 py-2 rounded-xl text-xs font-medium shadow-md border border-gray-100 hover:bg-gray-50 transition flex items-center gap-1.5 hidden sm:flex">
                          <Trees className="w-3 h-3"/> Street View
                        </button>
                      </div>
                    </div>
                  </section>

                  <div className="pt-6">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-medium tracking-wide hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      I am interested
                    </button>
                  </div>
                </motion.div>
              ) : isSubmitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-medium tracking-tight text-gray-900 mb-2">Thank you!</h3>
                  <p className="text-gray-500 mb-8 max-w-sm">
                    We have received your interest. Our team will contact you shortly to confirm your viewing.
                  </p>
                  <button onClick={handleClose} className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm">
                    Done
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                  <h3 className="text-xl font-medium tracking-tight text-gray-900 mb-6">Schedule a Viewing</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" required placeholder="Full Name" value={formData.name} onChange={r => setFormData({...formData, name: r.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="tel" required placeholder="Phone Number" value={formData.phone} onChange={r => setFormData({...formData, phone: r.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" required placeholder="Email Address" value={formData.email} onChange={r => setFormData({...formData, email: r.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors" />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="date" required value={formData.date} onChange={r => setFormData({...formData, date: r.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-light outline-none focus:bg-white focus:border-gray-300 transition-colors text-gray-600" />
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3.5 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        Back
                      </button>
                      <button type="submit" className="flex-1 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        Submit Request
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
      )}
    </>
  );
}
