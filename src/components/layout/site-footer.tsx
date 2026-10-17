import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { footerNav, siteConfig } from "@/lib/config/site";
import { CookieSettingsButton } from "@/components/layout/cookie-consent";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-900 text-navy-200">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid gap-9 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(2,1fr)] md:gap-8 lg:gap-10">
          <div className="max-w-xs">
            <Logo tone="light" />
            <p className="mt-4 text-sm leading-relaxed">
              Food, grocery, parcel and shop deliveries with local riders
              across Ilorin.
            </p>
            <p className="mt-4 text-sm text-white">
              Launching in {siteConfig.launchLocation}
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-display text-base font-semibold text-white">
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Drovna. All rights reserved.</p>
          <nav aria-label="Legal and privacy" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-white hover:underline">Terms &amp; Conditions</Link>
            <CookieSettingsButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
