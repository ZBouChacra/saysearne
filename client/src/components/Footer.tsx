import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold">
                S
              </div>
              <span className="font-serif text-lg font-bold">SaySerné</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">{t("footer.platform")}</h4>
            <div className="space-y-2">
              <Link href="/search" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.findProfessionals")}</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.aboutUs")}</Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.contactUs")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">{t("footer.forProfessionals")}</h4>
            <div className="space-y-2">
              <Link href="/profile" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.createProfile")}</Link>
              <Link href="/appointments" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.manageBookings")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">{t("footer.support")}</h4>
            <div className="space-y-2">
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.helpCenter")}</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">{t("footer.terms")}</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SaySerné. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
