"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, ExternalLink, Users, Calendar, IndianRupee, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const SCHEMES = [
  {
    id: "1",
    name: "PM Awas Yojana (Urban)",
    category: "Housing",
    description: "Affordable housing for urban poor. Subsidy on home loans for EWS/LIG/MIG categories.",
    eligibility: "Annual income below ₹18 lakh",
    benefit: "Up to ₹2.67 lakh subsidy",
    deadline: "2025-12-31",
    status: "active",
    beneficiaries: "1.2 Cr+",
    link: "https://pmaymis.gov.in",
  },
  {
    id: "2",
    name: "Swachh Bharat Mission",
    category: "Sanitation",
    description: "Construction of household toilets and community sanitation facilities.",
    eligibility: "BPL households",
    benefit: "₹12,000 per toilet",
    deadline: "2026-03-31",
    status: "active",
    beneficiaries: "10 Cr+",
    link: "https://swachhbharatmission.gov.in",
  },
  {
    id: "3",
    name: "AMRUT 2.0",
    category: "Infrastructure",
    description: "Water supply, sewerage, and urban transport infrastructure development.",
    eligibility: "Urban Local Bodies",
    benefit: "Project-based funding",
    deadline: "2026-03-31",
    status: "active",
    beneficiaries: "500+ cities",
    link: "https://amrut.gov.in",
  },
  {
    id: "4",
    name: "Smart Cities Mission",
    category: "Urban Development",
    description: "Technology-driven urban development for smart infrastructure and services.",
    eligibility: "Selected cities",
    benefit: "₹100 Cr per city",
    deadline: "2025-06-30",
    status: "active",
    beneficiaries: "100 cities",
    link: "https://smartcities.gov.in",
  },
  {
    id: "5",
    name: "PM Street Vendor's AtmaNirbhar Nidhi",
    category: "Livelihood",
    description: "Collateral-free working capital loans for street vendors.",
    eligibility: "Street vendors with vending certificate",
    benefit: "Loan up to ₹50,000",
    deadline: "2025-12-31",
    status: "active",
    beneficiaries: "50 Lakh+",
    link: "https://pmsvanidhi.mohua.gov.in",
  },
  {
    id: "6",
    name: "Deen Dayal Antyodaya Yojana",
    category: "Livelihood",
    description: "Skill training and livelihood enhancement for urban poor.",
    eligibility: "Urban poor families",
    benefit: "Free skill training + placement",
    deadline: "Ongoing",
    status: "active",
    beneficiaries: "25 Lakh+",
    link: "https://aajeevika.gov.in",
  },
  {
    id: "7",
    name: "Pradhan Mantri Ujjwala Yojana",
    category: "Energy",
    description: "Free LPG connections to women from BPL households.",
    eligibility: "BPL women",
    benefit: "Free LPG connection",
    deadline: "Ongoing",
    status: "active",
    beneficiaries: "9 Cr+",
    link: "https://pmuy.gov.in",
  },
  {
    id: "8",
    name: "Ayushman Bharat - PMJAY",
    category: "Health",
    description: "Health insurance coverage for secondary and tertiary hospitalization.",
    eligibility: "Bottom 40% families",
    benefit: "₹5 lakh per family per year",
    deadline: "Ongoing",
    status: "active",
    beneficiaries: "50 Cr+",
    link: "https://pmjay.gov.in",
  },
];

const CATEGORIES = ["All", "Housing", "Sanitation", "Infrastructure", "Urban Development", "Livelihood", "Energy", "Health"];

const categoryColor: Record<string, string> = {
  Housing: "bg-blue-500/20 text-blue-600",
  Sanitation: "bg-emerald-500/20 text-emerald-600",
  Infrastructure: "bg-amber-500/20 text-amber-600",
  "Urban Development": "bg-violet-500/20 text-violet-600",
  Livelihood: "bg-orange-500/20 text-orange-600",
  Energy: "bg-yellow-500/20 text-yellow-600",
  Health: "bg-rose-500/20 text-rose-600",
};

export default function SchemesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || s.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Government Schemes
              </h1>
              <p className="text-muted-foreground text-sm">Central & State government welfare schemes for citizens</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes..."
              className="pl-9 h-11 bg-white dark:bg-gray-800 border-2 hover:border-primary/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Schemes Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme, i) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={`text-xs ${categoryColor[scheme.category] ?? "bg-gray-500/20 text-gray-600"}`}>
                      {scheme.category}
                    </Badge>
                    <Badge className="text-xs bg-emerald-500/20 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2 leading-snug">{scheme.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Eligibility</p>
                        <p className="font-medium">{scheme.eligibility}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <IndianRupee className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Benefit</p>
                        <p className="font-medium text-emerald-600">{scheme.benefit}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="font-medium">{scheme.deadline}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">{scheme.beneficiaries}</span> beneficiaries
                      </p>
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" asChild>
                        <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                          Apply <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
            <Sparkles className="h-12 w-12 opacity-20" />
            <p className="text-lg font-medium">No schemes found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
