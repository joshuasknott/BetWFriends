import Link from "next/link";
import { LegalPage, LegalSection, legalMetadata } from "@/components/legal-page";

export const metadata = legalMetadata(
  "Responsible Play",
  "BetWFriends is designed for low-stakes fun between friends. Resources and tools for keeping it that way.",
);

const RESOURCES = [
  {
    name: "GamCare",
    url: "https://www.gamcare.org.uk",
    phone: "0808 8020 133",
    description: "Free information, support and counselling for problem gambling.",
  },
  {
    name: "BeGambleAware",
    url: "https://www.begambleaware.org",
    phone: "0808 8020 133",
    description: "Free, confidential help and advice about problem gambling.",
  },
  {
    name: "GamBan",
    url: "https://gamban.com",
    phone: null,
    description: "Software that blocks access to gambling sites across your devices.",
  },
  {
    name: "Gamblers Anonymous",
    url: "https://www.gamblersanonymous.org.uk",
    phone: "0330 094 0322",
    description: "Fellowship of people sharing their experience to help each other.",
  },
];

export default function ResponsiblePlayPage() {
  return (
    <LegalPage title="Responsible Play" updated="15 June 2026">
      <LegalSection>
        <p>
          BetWFriends is designed for <strong>low-stakes fun between
          friends</strong>. There is no bookmaker, no house edge, and no rake —
          it is a social pot, not a gambling product. Even so, we want everyone
          to enjoy it responsibly. This page explains the tools available and
          where to get help if betting stops feeling fun.
        </p>
      </LegalSection>

      <LegalSection heading="What BetWFriends is — and isn't">
        <p>
          BetWFriends is a <strong>friends-only social wagering app</strong>. The
          stakes stay small and the people involved know each other. We are{" "}
          <strong>not a licensed gambling operator</strong>, do not offer odds,
          and do not profit from losses. Money flows from participants to
          participants — BetWFriends takes no cut of any bet.
        </p>
      </LegalSection>

      <LegalSection heading="Keeping it friendly">
        <p>A few principles we encourage in every group:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Only bet what you can afford to lose.</strong> Treat stakes
            like the cost of a round at the pub — if losing it would cause stress,
            it is too much.
          </li>
          <li>
            <strong>Know your friends.</strong> Only invite people you know.
            Don&rsquo;t pressure anyone into betting.
          </li>
          <li>
            <strong>Keep stakes small.</strong> There is no minimum and no benefit
            to large stakes. Bragging rights are the real prize.
          </li>
          <li>
            <strong>Settle honestly.</strong> The bet creator settles each bet.
            Be fair, transparent, and quick about it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Tools in the app">
        <p>
          We have built a few guardrails into the Service:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Top-up limits.</strong> Card top-ups are capped (minimum £1,
            maximum £1,000 per top-up) to discourage loading large balances.
          </li>
          <li>
            <strong>Transparent history.</strong> Every stake, payout, and
            top-up is recorded in your{" "}
            <Link href="/wallet" className="font-bold text-brand-600 hover:underline">
              wallet activity
            </Link>{" "}
            so you can always see where your money went.
          </li>
          <li>
            <strong>No pressure.</strong> You can withdraw your stake from any
            open bet at any time before it closes, no questions asked.
          </li>
          <li>
            <strong>Self-exclusion.</strong> You can{" "}
            <Link href="/profile" className="font-bold text-brand-600 hover:underline">
              delete your account
            </Link>{" "}
            at any time, which forfeits open wagers and removes you from all
            groups permanently.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="If it stops being fun">
        <p>
          If betting is causing you stress, financial worry, or affecting your
          relationships, please take a break and reach out for support. Asking for
          help is a sign of strength. The organisations below are free and
          confidential.
        </p>
      </LegalSection>

      <LegalSection heading="Where to get help">
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {RESOURCES.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border-2 border-brand-100 bg-white p-5 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-ink">{r.name}</span>
                <span className="text-brand-600" aria-hidden>↗</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {r.description}
              </p>
              {r.phone && (
                <p className="mt-2 text-xs font-bold text-brand-600">
                  Helpline: {r.phone}
                </p>
              )}
            </a>
          ))}
        </div>
      </LegalSection>

      <LegalSection heading="Under 18?">
        <p>
          BetWFriends is strictly for adults aged 18 and over. If you are under 18
          and have created an account,{" "}
          <a href="mailto:support@betwfriends.app" className="font-bold text-brand-600 hover:underline">
            contact us
          </a>{" "}
          and we will remove it immediately.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
