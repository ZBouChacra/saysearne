import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { Search as SearchIcon, Filter, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";

export default function Search() {
  const searchParams = new URLSearchParams(useSearch());
  const initialCatId = searchParams.get("categoryId");

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    categoryId: initialCatId ? Number(initialCatId) : undefined as number | undefined,
    serviceId: undefined as number | undefined,
    sex: undefined as string | undefined,
    nationality: "",
    minStars: undefined as number | undefined,
    minCost: undefined as number | undefined,
    maxCost: undefined as number | undefined,
    minExperience: undefined as number | undefined,
    maxExperience: undefined as number | undefined,
    hasTeam: undefined as boolean | undefined,
    sortBy: "stars",
    sortOrder: "desc",
    page: 1,
  });

  const queryFilters = useMemo(() => {
    const f: any = { ...filters };
    Object.keys(f).forEach(k => {
      if (f[k] === "" || f[k] === undefined) delete f[k];
    });
    return f;
  }, [filters]);

  const { data, isLoading } = trpc.professionals.search.useQuery(queryFilters);
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allServices } = trpc.categories.allServices.useQuery();

  const filteredServices = useMemo(() => {
    if (!allServices || !filters.categoryId) return allServices || [];
    return allServices.filter(s => s.categoryId === filters.categoryId);
  }, [allServices, filters.categoryId]);

  useEffect(() => {
    if (initialCatId) {
      setFilters(f => ({ ...f, categoryId: Number(initialCatId) }));
    }
  }, [initialCatId]);

  const updateFilter = (key: string, value: any) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      firstName: "", lastName: "", categoryId: undefined, serviceId: undefined,
      sex: undefined, nationality: "", minStars: undefined, minCost: undefined,
      maxCost: undefined, minExperience: undefined, maxExperience: undefined,
      hasTeam: undefined, sortBy: "stars", sortOrder: "desc", page: 1,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6">Find Professionals</h1>

        {/* Quick Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="First name..."
              value={filters.firstName}
              onChange={(e) => updateFilter("firstName", e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Last name..."
              value={filters.lastName}
              onChange={(e) => updateFilter("lastName", e.target.value)}
              className="max-w-xs"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border border-border bg-card p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-semibold">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" /> Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Category</Label>
                <Select
                  value={filters.categoryId?.toString() || "all"}
                  onValueChange={(v) => {
                    updateFilter("categoryId", v === "all" ? undefined : Number(v));
                    updateFilter("serviceId", undefined);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Service</Label>
                <Select
                  value={filters.serviceId?.toString() || "all"}
                  onValueChange={(v) => updateFilter("serviceId", v === "all" ? undefined : Number(v))}
                >
                  <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {filteredServices?.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Gender</Label>
                <Select
                  value={filters.sex || "all"}
                  onValueChange={(v) => updateFilter("sex", v === "all" ? undefined : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Nationality</Label>
                <Input
                  placeholder="e.g. French"
                  value={filters.nationality}
                  onChange={(e) => updateFilter("nationality", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Min Stars</Label>
                <Select
                  value={filters.minStars?.toString() || "any"}
                  onValueChange={(v) => updateFilter("minStars", v === "any" ? undefined : Number(v))}
                >
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Min Cost/hr</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minCost || ""}
                  onChange={(e) => updateFilter("minCost", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Max Cost/hr</Label>
                <Input
                  type="number"
                  placeholder="Any"
                  value={filters.maxCost || ""}
                  onChange={(e) => updateFilter("maxCost", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Min Experience (yrs)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minExperience || ""}
                  onChange={(e) => updateFilter("minExperience", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.hasTeam || false}
                    onCheckedChange={(v) => updateFilter("hasTeam", v || undefined)}
                  />
                  <Label className="text-xs">Has Team</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-border">
              <div>
                <Label className="text-xs mb-1.5 block">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">Rating</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Order</Label>
                <Select value={filters.sortOrder} onValueChange={(v) => updateFilter("sortOrder", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} professional${data.total !== 1 ? "s" : ""} found` : "Searching..."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data && data.results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.results.map((pro) => (
                <ProfessionalCard
                  key={`${pro.userId}-${pro.professionId}`}
                  userId={pro.userId}
                  firstName={pro.firstName}
                  lastName={pro.lastName}
                  userName={pro.userName}
                  profilePhoto={pro.profilePhoto}
                  avgRating={pro.avgRating}
                  totalReviews={pro.totalReviews}
                  costPerHour={pro.costPerHour}
                  yearsOfExperience={pro.yearsOfExperience}
                  isPremium={pro.isPremium}
                  isStarred={pro.isStarred}
                  hasTeam={pro.hasTeam}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted-foreground px-3">
                  Page {filters.page} of {Math.ceil(data.total / 20)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= Math.ceil(data.total / 20)}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-border">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No professionals match your criteria</p>
            <Button variant="ghost" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
