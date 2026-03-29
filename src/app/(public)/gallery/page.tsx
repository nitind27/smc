"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Play, Filter } from "lucide-react";

const GALLERY_ITEMS = [
  { id: 1, title: "New Flyover Construction — NH-48", category: "Infrastructure", year: "2026", gradient: "from-blue-600 to-cyan-500", desc: "6-lane flyover connecting North and South zones, reducing traffic by 40%" },
  { id: 2, title: "Smart Park Development — Zone 3", category: "Parks", year: "2026", gradient: "from-emerald-600 to-green-400", desc: "Modern park with jogging track, children's play area and solar lighting" },
  { id: 3, title: "Solar Street Lighting Project", category: "Energy", year: "2025", gradient: "from-amber-500 to-yellow-400", desc: "500 solar-powered LED street lights installed across 15 wards" },
  { id: 4, title: "Water Treatment Plant Upgrade", category: "Water", year: "2025", gradient: "from-cyan-600 to-blue-400", desc: "Capacity increased to 50 MLD, serving 2 lakh additional households" },
  { id: 5, title: "Community Center — Ward 10", category: "Social", year: "2026", gradient: "from-violet-600 to-purple-400", desc: "Multi-purpose community center with auditorium, library and sports facility" },
  { id: 6, title: "Waste Management Unit", category: "Sanitation", year: "2025", gradient: "from-green-600 to-emerald-400", desc: "Modern waste segregation and composting facility processing 50 tons/day" },
  { id: 7, title: "Road Widening — Main Boulevard", category: "Roads", year: "2026", gradient: "from-slate-600 to-gray-500", desc: "4-lane road widening project covering 12 km of main city roads" },
  { id: 8, title: "Digital Kiosk Installation", category: "Technology", year: "2026", gradient: "from-indigo-600 to-blue-500", desc: "50 digital kiosks for citizen services across all major public areas" },
  { id: 9, title: "Drainage Upgrade — Zone B", category: "Drainage", year: "2025", gradient: "from-teal-600 to-cyan-500", desc: "Underground drainage network upgraded to prevent waterlogging" },
  { id: 10, title: "School Renovation Project", category: "Education", year: "2025", gradient: "from-rose-600 to-pink-500", desc: "15 municipal schools renovated with smart classrooms and labs" },
  { id: 11, title: "Public Toilet Complex", category: "Sanitation", year: "2026", gradient: "from-orange-500 to-amber-400", desc: "20 modern public toilet complexes with 24/7 water supply" },
  { id: 12, title: "Heritage Building Restoration", category: "Heritage", year: "2025", gradient: "from-yellow-600 to-amber-500", desc: "Restoration of 3 heritage buildings preserving city's cultural identity" },
];

const CATEGORIES = ["All", ...Array.from(new Set(GALLERY_ITEMS.map(g => g.category)))];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered = activeCategory === "All" ? GALLERY_ITEMS : GALLERY_ITEMS.filter(g => g.category === activeCategory);

  const openLightbox = (item: typeof GALLERY_ITEMS[0], index: number) => {
    setLightbox(item);
    setLightboxIndex(index);
  };

  const navigate = (dir: number) => {
    const newIndex = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(newIndex);
    setLightbox(filtered[newIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl"><ImageIcon className="h-8 w-8 text-yellow-300" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">City Development Gallery</h1>
              <p className="text-white/70 text-sm mt-0.5">Visual showcase of municipal development projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                activeCategory === cat ? "bg-[#1a3a6b] text-white border-[#1a3a6b]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b]/40"
              }`}>
              {cat} {cat !== "All" && <span className="ml-1 opacity-60">({GALLERY_ITEMS.filter(g => g.category === cat).length})</span>}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500">{filtered.length} projects</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <button onClick={() => openLightbox(item, i)}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} aspect-[4/3] w-full flex items-end p-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="relative z-10 text-left">
                  <Badge className="bg-white/20 text-white border-0 text-xs mb-1.5">{item.category}</Badge>
                  <p className="text-white font-bold text-sm leading-snug">{item.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{item.year}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <div className={`bg-gradient-to-br ${lightbox.gradient} rounded-2xl aspect-video flex items-center justify-center`}>
                <div className="text-center text-white p-8">
                  <Badge className="bg-white/20 text-white border-0 mb-3">{lightbox.category}</Badge>
                  <h3 className="text-2xl font-bold mb-2">{lightbox.title}</h3>
                  <p className="text-white/80 text-sm">{lightbox.desc}</p>
                  <p className="text-white/50 text-xs mt-3">Year: {lightbox.year}</p>
                </div>
              </div>
              <button onClick={() => setLightbox(null)}
                className="absolute -top-3 -right-3 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 text-gray-700" />
              </button>
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  <ChevronLeft className="h-5 w-5" /> Previous
                </button>
                <span className="text-white/50 text-sm">{lightboxIndex + 1} / {filtered.length}</span>
                <button onClick={() => navigate(1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  Next <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
