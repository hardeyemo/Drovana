export const siteConfig = {
  name: "Drovna",
  tagline: "Good things, on their way.",
  description:
    "Order food, groceries and local finds, or send a parcel across Ilorin with Drovna.",
  launchLocation: "Ilorin, Kwara State, Nigeria",
} as const;

export type NavLink = { href: string; label: string };

export const primaryNav: NavLink[] = [
  { href: "/services", label: "Explore" },
  { href: "/deliveries/track", label: "Track order" },
  { href: "/applications/rider", label: "Become a rider" },
];

export const bookingHref = "/deliveries/new";
export const signInHref = "/login";

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Deliveries",
    links: [
      { href: "/deliveries/new", label: "Book a delivery" },
      { href: "/services", label: "Services" },
      { href: "/deliveries/track", label: "Track an order" },
      { href: "/applications/business", label: "For businesses" },
    ],
  },
  {
    title: "Riders",
    links: [
      { href: "/applications/rider", label: "Become a rider" },
      { href: "/rider/dashboard", label: "Rider dashboard" },
    ],
  },
];

