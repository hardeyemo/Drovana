import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for using Drovna delivery services, customer accounts, rider tools, and payments.",
};

const sections = [
  {
    id: "acceptance",
    title: "1. About these terms",
    paragraphs: [
      "These draft Terms & Conditions describe the intended use of Drovna’s website and delivery services in Ilorin, Kwara State. By creating an account, placing a request, or using a rider account, you agree to follow the applicable terms below.",
      "Drovna connects customers with delivery services provided by approved local riders and supports booking, status updates, and payment processing. The exact legal relationship between Drovna, customers, riders, and any merchants must be confirmed by Nigerian legal counsel before publication.",
    ],
  },
  {
    id: "accounts",
    title: "2. Accounts and accurate information",
    paragraphs: [
      "Provide accurate contact, pickup, drop-off, and account details and keep them current. You are responsible for activity carried out through your account and for protecting your sign-in credentials. Tell Drovna promptly if you believe your account has been accessed without permission.",
      "You must be signed in before you can book or pay. Drovna may restrict access where information is materially false, an account is misused, or a restriction is needed for safety or legal compliance. Any suspension or account-closure process requires legal and operational review before launch.",
    ],
  },
  {
    id: "customers",
    title: "3. Customer responsibilities",
    bullets: [
      "Enter complete addresses, an accessible pickup point, a valid phone number, and clear delivery notes.",
      "Make the item available, packaged appropriately, and ready for collection; ensure the recipient can receive it.",
      "Only request delivery of items you are allowed to send and that can be transported safely and lawfully.",
      "Review the displayed delivery fee and total before starting payment. Contact support if a request or payment status appears incorrect.",
    ],
  },
  {
    id: "riders",
    title: "4. Rider responsibilities",
    paragraphs: [
      "Rider accounts require application review. Approval permits access to rider features but does not promise a particular number of jobs, earnings, or delivery times.",
    ],
    bullets: [
      "Keep application, vehicle, registration, contact, and availability information accurate.",
      "Accept only requests you can complete safely; handle items with reasonable care and update delivery status accurately.",
      "Use customer details only as needed to complete the accepted delivery and do not disclose or reuse them for another purpose.",
      "Report safety incidents, loss, damage, or inability to complete an accepted delivery through Drovna’s designated support channel.",
    ],
    review: "LEGAL REVIEW REQUIRED: confirm rider classification, insurance, safety, screening, tax, and incident-reporting terms before launch.",
  },
  {
    id: "delivery",
    title: "5. Requests, availability, and delivery status",
    paragraphs: [
      "A delivery request is not a guarantee that a rider will accept it or that it will arrive by a particular time. Availability and timing depend on active riders and other conditions. Tracking statuses describe the latest recorded progress and may not update immediately.",
      "Drovna currently displays launch-rate estimates by delivery type for Ilorin. The applicable amount is shown before payment. If a displayed amount or request detail changes, review the updated amount before paying; do not proceed if it is unclear.",
    ],
  },
  {
    id: "payments",
    title: "6. Payments",
    paragraphs: [
      "Online payments are initiated through Paystack in Nigerian naira (NGN). Payment is treated as successful only after the payment provider’s result is verified by Drovna. A browser return page alone is not proof of payment.",
      "Your bank or payment provider may apply its own terms and processing rules. Do not share card PINs, one-time passwords, or other authentication codes with a rider or anyone claiming to provide Drovna support.",
    ],
    review: "LEGAL/OPERATIONS REVIEW REQUIRED: publish a monitored support contact and confirm how failed, duplicate, delayed, disputed, and reversed payments are handled before accepting live payments.",
  },
  {
    id: "cancellations-refunds",
    title: "7. Cancellations and refunds",
    paragraphs: [
      "Cancellation availability depends on the request and payment status. The current app does not provide a customer-facing cancellation or refund workflow. Contact Drovna support as soon as possible if you need help with a request or payment.",
      "A refund is not promised by these draft terms. Requests must be reviewed against the delivery status, verified payment record, payment-provider process, and any rights that apply by law. Do not treat a pending payment result as a confirmed refund or reversal.",
    ],
    review: "LEGAL/OPERATIONS REVIEW REQUIRED: define cancellation cutoffs, refund eligibility, processing timelines, payment disputes, and support contact before launch.",
  },
  {
    id: "prohibited",
    title: "8. Prohibited activities and items",
    bullets: [
      "Do not use Drovna to break the law, deceive others, interfere with the platform, or evade payment.",
      "Do not request or accept delivery of illegal, dangerous, restricted, or improperly packaged items.",
      "Do not threaten, harass, discriminate against, or endanger customers, riders, merchants, or support staff.",
      "Do not access another person’s account or private delivery information without permission.",
    ],
    review: "LEGAL REVIEW REQUIRED: add a jurisdiction-specific prohibited-items list and an escalation process before launch.",
  },
  {
    id: "availability-liability",
    title: "9. Service availability and responsibility",
    paragraphs: [
      "The website and its features may be unavailable or changed for maintenance, security, provider outages, or operational reasons. Drovna does not promise uninterrupted access or a particular delivery outcome.",
      "Nothing in these draft terms is intended to exclude or limit a consumer right, remedy, or responsibility that cannot lawfully be excluded or limited. Any other allocation of responsibility, exclusions, or financial limits must be reviewed and approved by Nigerian legal counsel before publication.",
    ],
    review: "LEGAL REVIEW REQUIRED: finalize liability, claims, insurance, force-majeure, and dispute-resolution language without limiting non-waivable rights.",
  },
  {
    id: "changes-contact",
    title: "10. Changes and contact",
    paragraphs: [
      "Drovna may update these terms as the service changes. The published version should show its effective date and explain material changes to affected users.",
      "For help with a booking, rider application, payment, or these terms, contact Drovna through the support channel published on this site.",
    ],
    review: "LEGAL/OPERATIONS REVIEW REQUIRED: add the approved effective date, Drovna legal entity name, service address, and monitored contact details before publication.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-[#de7844]">Drovna · Ilorin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#263d32] sm:text-5xl">Terms &amp; Conditions</h1>
        <p className="mt-4 text-sm text-[#718077]">Draft for review · Effective date: <strong className="text-[#34483a]">To be confirmed</strong></p>
        <div role="note" className="mt-6 rounded-2xl border border-[#e9d4a9] bg-[#fff8e9] p-5 text-sm leading-relaxed text-[#6e5b36]">
          <strong className="block text-[#59451f]">Legal review required before publication</strong>
          <span className="mt-1 block">This working draft reflects features currently present in the app. It is not legal advice or a final contract. Items marked for legal or operations review must be resolved by qualified Nigerian counsel and Drovna’s operations team before launch.</span>
        </div>
      </header>

      <nav aria-label="Terms sections" className="mt-8 rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-[#34483a]">On this page</h2>
        <ul className="mt-3 grid gap-2 text-sm text-[#456349] sm:grid-cols-2">
          {sections.map((section) => <li key={section.id}><a className="underline decoration-[#cbd7c9] underline-offset-4 hover:text-[#de7844]" href={`#${section.id}`}>{section.title}</a></li>)}
        </ul>
      </nav>

      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-7">
            <h2 className="font-display text-xl font-semibold text-[#263d32] sm:text-2xl">{section.title}</h2>
            {"paragraphs" in section && section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-[#64716b]">{paragraph}</p>)}
            {"bullets" in section && section.bullets && <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#64716b]">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            {"review" in section && <p role="note" className="mt-4 rounded-xl bg-[#fff8e9] p-3 text-xs font-semibold leading-relaxed text-[#735d31]">{section.review}</p>}
          </section>
        ))}
      </div>
    </main>
  );
}
