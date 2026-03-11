import { Link } from "wouter";

export default function Footer() {
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
              Connecting clients with top-rated professionals through a seamless omnichannel experience.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Platform</h4>
            <div className="space-y-2">
              <Link href="/search" className="block text-sm text-muted-foreground hover:text-foreground">Find Professionals</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">About Us</Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contact Us</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">For Professionals</h4>
            <div className="space-y-2">
              <Link href="/profile" className="block text-sm text-muted-foreground hover:text-foreground">Create Profile</Link>
              <Link href="/appointments" className="block text-sm text-muted-foreground hover:text-foreground">Manage Bookings</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Help Center</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SaySerné. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
