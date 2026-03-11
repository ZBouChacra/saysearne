import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Star, Users, Globe, Zap, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-20">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">About SaySerné</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            SaySerné is a next-generation professional services marketplace built on trust, transparency,
            and an omnichannel approach to connecting clients with the right professionals.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe that finding the right professional should be simple, transparent, and trustworthy.
              SaySerné was created to bridge the gap between clients seeking quality services and professionals
              looking to grow their practice.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform uses a meritocratic ranking system where professionals earn their reputation
              through verified client reviews, ensuring that quality always rises to the top.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">Our Values</h2>
            <div className="space-y-4">
              {[
                { icon: Shield, title: "Trust & Transparency", desc: "Every review is verified through completed bookings" },
                { icon: Star, title: "Meritocracy", desc: "Rankings based on real performance, not paid placement alone" },
                { icon: Globe, title: "Omnichannel Access", desc: "Seamless experience across web, mobile, and all touchpoints" },
                { icon: Heart, title: "Community First", desc: "Building meaningful connections between professionals and clients" },
              ].map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50 py-16">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse & Search", desc: "Explore professionals by category, service, rating, and more. No account needed to browse." },
              { step: "02", title: "Book & Connect", desc: "Create an account, request appointments, and chat directly with professionals." },
              { step: "03", title: "Review & Rate", desc: "After a completed booking, share your experience to help the community." },
            ].map((s, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl font-serif font-bold text-primary/20 mb-4">{s.step}</div>
                <h3 className="font-serif font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
