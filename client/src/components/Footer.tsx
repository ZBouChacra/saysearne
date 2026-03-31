import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028917317/fSXYjnqatsqbzh69FLd2k9/pasted_file_6EBrEK_SaySerné_a891392f.png";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border/40 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={LOGO_URL} alt="SaySerné" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-serif text-xl font-bold">
                Say<span className="text-primary">Serné</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4 text-sm uppercase tracking-wider text-primary">{t("footer.platform")}</h4>
            <div className="space-y-2.5">
              <Link href="/search" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.findProfessionals")}</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.aboutUs")}</Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.contactUs")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4 text-sm uppercase tracking-wider text-primary">{t("footer.forProfessionals")}</h4>
            <div className="space-y-2.5">
              <Link href="/profile" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.createProfile")}</Link>
              <Link href="/appointments" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.manageBookings")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-bold mb-4 text-sm uppercase tracking-wider text-primary">{t("footer.support")}</h4>
            <div className="space-y-2.5">
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.helpCenter")}</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/30 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SaySerné. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
