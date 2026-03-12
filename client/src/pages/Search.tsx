import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search as SearchIcon, Filter, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";

export default function Search() {
  const { t, lang } = useLanguage();
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
    country: "",
    city: "",
    hasOffice: undefined as boolean | undefined,
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
      sex: undefined, nationality: "", country: "", city: "",
      hasOffice: undefined, minStars: undefined, minCost: undefined,
      maxCost: undefined, minExperience: undefined, maxExperience: undefined,
      hasTeam: undefined, sortBy: "stars", sortOrder: "desc", page: 1,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6">{t("search.title")}</h1>

        {/* Quick Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder={t("search.firstName")}
              value={filters.firstName}
              onChange={(e) => updateFilter("firstName", e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder={t("search.lastName")}
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
            {t("search.filters")}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border border-border bg-card p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-semibold">{t("search.advancedFilters")}</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" /> {t("search.clearAll")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">{t("search.category")}</Label>
                <Select
                  value={filters.categoryId?.toString() || "all"}
                  onValueChange={(v) => {
                    updateFilter("categoryId", v === "all" ? undefined : Number(v));
                    updateFilter("serviceId", undefined);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder={t("search.allCategories")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("search.allCategories")}</SelectItem>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {lang === "ar" && c.nameAr ? c.nameAr : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.service")}</Label>
                <Select
                  value={filters.serviceId?.toString() || "all"}
                  onValueChange={(v) => updateFilter("serviceId", v === "all" ? undefined : Number(v))}
                >
                  <SelectTrigger><SelectValue placeholder={t("search.allServices")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("search.allServices")}</SelectItem>
                    {filteredServices?.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {lang === "ar" && s.nameAr ? s.nameAr : s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.country")}</Label>
                <Input
                  placeholder={t("search.allCountries")}
                  value={filters.country}
                  onChange={(e) => updateFilter("country", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.city")}</Label>
                <Input
                  placeholder={t("search.allCities")}
                  value={filters.city}
                  onChange={(e) => updateFilter("city", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.gender")}</Label>
                <Select
                  value={filters.sex || "all"}
                  onValueChange={(v) => updateFilter("sex", v === "all" ? undefined : v)}
                >
                  <SelectTrigger><SelectValue placeholder={t("search.any")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("search.any")}</SelectItem>
                    <SelectItem value="male">{t("search.male")}</SelectItem>
                    <SelectItem value="female">{t("search.female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.nationality")}</Label>
                <Input
                  placeholder={t("search.any")}
                  value={filters.nationality}
                  onChange={(e) => updateFilter("nationality", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.minStars")}</Label>
                <Select
                  value={filters.minStars?.toString() || "any"}
                  onValueChange={(v) => updateFilter("minStars", v === "any" ? undefined : Number(v))}
                >
                  <SelectTrigger><SelectValue placeholder={t("search.any")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t("search.any")}</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.minCost")}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minCost || ""}
                  onChange={(e) => updateFilter("minCost", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.maxCost")}</Label>
                <Input
                  type="number"
                  placeholder={t("search.any")}
                  value={filters.maxCost || ""}
                  onChange={(e) => updateFilter("maxCost", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">{t("search.minExperience")}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minExperience || ""}
                  onChange={(e) => updateFilter("minExperience", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.hasTeam || false}
                    onCheckedChange={(v) => updateFilter("hasTeam", v || undefined)}
                  />
                  <Label className="text-xs">{t("search.hasTeam")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.hasOffice || false}
                    onCheckedChange={(v) => updateFilter("hasOffice", v || undefined)}
                  />
                  <Label className="text-xs">{t("search.hasOffice")}</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-border">
              <div>
                <Label className="text-xs mb-1.5 block">{t("search.sortBy")}</Label>
                <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">{t("search.rating")}</SelectItem>
                    <SelectItem value="cost">{t("search.cost")}</SelectItem>
                    <SelectItem value="experience">{t("search.experience")}</SelectItem>
                    <SelectItem value="age">{t("search.age")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">{t("search.order")}</Label>
                <Select value={filters.sortOrder} onValueChange={(v) => updateFilter("sortOrder", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">{t("search.descending")}</SelectItem>
                    <SelectItem value="asc">{t("search.ascending")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {data
              ? t("search.professionalsFound")
                  .replace("{count}", String(data.total))
                  .replace("{s}", data.total !== 1 ? "s" : "")
              : t("search.searching")}
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
                  country={pro.country}
                  city={pro.city}
                  hasOffice={pro.hasOffice}
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
                  {t("search.previous")}
                </Button>
                <span className="flex items-center text-sm text-muted-foreground px-3">
                  {t("search.page")
                    .replace("{current}", String(filters.page))
                    .replace("{total}", String(Math.ceil(data.total / 20)))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= Math.ceil(data.total / 20)}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                >
                  {t("search.next")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-border">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("search.noResults")}</p>
            <Button variant="ghost" className="mt-4" onClick={clearFilters}>{t("search.clearFilters")}</Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
