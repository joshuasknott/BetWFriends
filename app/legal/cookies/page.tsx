import Link from "next/link";
import { LegalPage, LegalSection, legalMetadata } from "@/components/legal-page";

export const metadata = legalMetadata(
  "Cookie Policy",
  "How BetWFriends uses cookies and similar technologies.",
);

const COOKIES = [
  {
    name: "bwf_session",
    purpose: "Keeps you signed in. Contains a signed JWT token — no personal data stored in it.",
    type: "Essential",
    duration: "30 days",
  },
  {
    name: "bwf_csrf",
    purpose: "Security token that protects against cross-site request forgery (CSRF) attacks.",
    type: "Essential",
    duration: "30 days",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="15 June 2026">
      <LegalSection>
        <p>
          BetWFriends uses a small number of cookies to keep you signed in and to
          protect your account. This policy explains what we use and why. For how
          we handle your personal data more broadly, see our{" "}
          <Link href="/legal/privacy" className="font-bold text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="What is a cookie?">
        <p>
          A cookie is a small text file stored on your device by your browser when
          you visit a website. Cookies allow a site to &ldquo;remember&rdquo; you
          between page loads — for example, so you don&rsquo;t have to log in
          again on every click.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies we set">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-brand-100">
                <th className="py-2 pr-4 font-black text-ink">Cookie</th>
                <th className="py-2 pr-4 font-black text-ink">Type</th>
                <th className="py-2 pr-4 font-black text-ink">Duration</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name} className="border-b border-brand-50 align-top">
                  <td className="py-3 pr-4">
                    <code className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs text-brand-700">
                      {c.name}
                    </code>
                  </td>
                  <td className="py-3 pr-4 font-bold text-ink">{c.type}</td>
                  <td className="py-3 pr-4 text-ink-soft">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Both cookies are <strong>strictly necessary</strong> for the Service to
          function. Without the session cookie you cannot stay logged in, and
          without the CSRF cookie we cannot protect your account from forged
          requests. We do not use advertising, tracking, or analytics cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Third-party cookies">
        <p>
          When you top up your wallet by card in live mode, Stripe may set its own
          cookies as part of the payment flow. These are governed by{" "}
          <a
            href="https://stripe.com/cookies-policy"
            className="font-bold text-brand-600 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe&rsquo;s cookie policy
          </a>
          . We do not control and do not have access to Stripe&rsquo;s cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Managing cookies">
        <p>
          Because our cookies are strictly necessary, you cannot disable them and
          continue to use the logged-in parts of the Service. However, you can
          clear cookies at any time via your browser settings. Doing so will log
          you out and you will need to sign in again.
        </p>
        <p>
          Most browsers let you refuse or delete cookies — see your
          browser&rsquo;s help pages for instructions.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we add new cookies in future we will update this page and note the
          &ldquo;last updated&rdquo; date above.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about cookies? Email{" "}
          <a href="mailto:privacy@betwfriends.app" className="font-bold text-brand-600 hover:underline">
            privacy@betwfriends.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
