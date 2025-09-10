import Link from "next/link";
import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Chen",
    username: "@sarahchen",
    body: "POSify has transformed our restaurant operations. Order processing is now 3x faster and our staff loves the intuitive interface.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Marcus Rodriguez",
    username: "@marcusrod",
    body: "The analytics dashboard gives us insights we never had before. We've increased our revenue by 25% since switching to POSify.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Emily Johnson",
    username: "@emilyj",
    body: "Managing our 5 restaurant locations has never been easier. The centralized dashboard is a game-changer for our business.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "David Kim",
    username: "@davidkim",
    body: "The menu management system is incredibly user-friendly. We can update prices and availability instantly across all locations.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Lisa Thompson",
    username: "@lisathompson",
    body: "Customer support is outstanding. They helped us migrate from our old system seamlessly. Highly recommend POSify!",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Alex Chen",
    username: "@alexchen",
    body: "The real-time reporting features help us make data-driven decisions. Our profit margins have improved significantly.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Rachel Green",
    username: "@rachelgreen",
    body: "POSify's inventory tracking has eliminated our stock issues. We never run out of popular items anymore.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "James Wilson",
    username: "@jameswilson",
    body: "The mobile app for staff is incredibly intuitive. Training new employees takes half the time it used to.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Maria Garcia",
    username: "@mariagarcia",
    body: "Switching to POSify was the best business decision we made this year. Our operations are so much more efficient now.",
    img: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
  },
];

const testimonialColumns = [
  testimonials.slice(0, 3),
  testimonials.slice(3, 6),
  testimonials.slice(6, 9),
];

const TestimonialCard = ({ img, name, username, body }) => {
  return (
    <Card className="relative w-full max-w-xs overflow-hidden border-border/50 bg-gradient-to-b from-card/50 to-card/[0.02] shadow-[0px_2px_0px_0px_hsl(var(--foreground)/0.1)_inset]">
      <div className="absolute -top-5 -left-5 -z-10 h-40 w-40 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-md"></div>

      <CardContent className="p-6">
        <p className="text-foreground/90 leading-relaxed mb-4">{body}</p>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={img || "/placeholder.svg"} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium text-foreground">{name}</div>
            <div className="text-sm text-muted-foreground">{username}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function TestimonialSection() {
  return (
    <section id="testimonials" className="py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-[540px]">
          <div className="flex justify-center">
            <button
              type="button"
              className="group relative z-10 mx-auto rounded-full border border-border/50 bg-card/50 px-6 py-1 text-xs backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 md:text-sm"
            >
              <div className="absolute inset-x-0 -top-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent shadow-2xl transition-all duration-500 group-hover:w-3/4"></div>
              <div className="absolute inset-x-0 -bottom-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent shadow-2xl transition-all duration-500 group-hover:h-px"></div>
              <span className="relative text-foreground">Testimonials</span>
            </button>
          </div>
          <h2 className="from-foreground/60 via-foreground to-foreground/60 dark:from-muted-foreground/55 dark:via-foreground dark:to-muted-foreground/55 mt-3 bg-gradient-to-r bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px] __className_bb4e88 relative z-10">
            What our customers say
          </h2>

          <p className="mt-3 relative z-10 text-center text-lg text-muted-foreground">
            From small cafes to large restaurant chains, POSify is trusted by
            businesses worldwide to streamline their operations.
          </p>
        </div>

        <div className="my-8 flex max-h-[738px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          {testimonialColumns.map((column, index) => (
            <div
              key={index}
              className={
                index === 0
                  ? ""
                  : index === 1
                  ? "hidden md:block"
                  : "hidden lg:block"
              }
            >
              <Marquee
                pauseOnHover
                vertical
                reverse={index === 1}
                className={`[--duration:${20 + index * 5}s]`}
              >
                {column.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.username}
                    {...testimonial}
                  />
                ))}
              </Marquee>
            </div>
          ))}
        </div>

        <div className="-mt-8 flex justify-center">
          <Button
            variant="outline"
            asChild
            className="border-primary/30 bg-background/50 hover:border-primary/60 hover:bg-primary/10"
          >
            <Link href="/testimonial" className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
              </svg>
              Share your experience
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
