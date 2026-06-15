import { LegalPage, LegalSection, legalMetadata } from "@/components/legal-page";

export const metadata = legalMetadata(
  "Privacy Policy",
  "How BetWFriends collects, uses, and protects your personal information.",
);

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="15 June 2026">
      <LegalSection>
        <p>
          BetWFriends (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;the
          service&rdquo;) is a friends-only social betting app for low-stakes
          wagers between people who know each other. This policy explains what
          information we collect, why we collect it, and the choices you have.
        </p>
        <p>
          This service is operated from the United Kingdom. By creating an
          account, you agree to the practices described here and in our{" "}
          <a href="/legal/terms" className="font-bold text-brand-600 hover:underline">
            Terms of Service
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>
          <strong>Account information.</strong> Your name, email address, and a
          hashed password. We never store passwords in plain text.
        </p>
        <p>
          <strong>Usage data.</strong> The groups you join, bets you create or
          enter, wagers you place, wallet balance, and transaction history. This
          data is essential to running the service.
        </p>
        <p>
          <strong>Payment data.</strong> When you top up your wallet by card,
          payment is processed by Stripe. We do not store your card number, CVC,
          or full card details — Stripe handles that. We retain a record of the
          transaction amount and a Stripe reference for your ledger.
        </p>
        <p>
          <strong>Technical data.</strong> Standard server logs including IP
          address, browser type, and timestamps, used for security, rate limiting,
          and abuse prevention.
        </p>
      </LegalSection>

      <LegalSection heading="Why we use your data">
        <ul className="ml-5 list-disc space-y-2">
          <li>To provide your account, groups, bets, and wallet.</li>
          <li>To settle bets and maintain an accurate balance ledger.</li>
          <li>To process top-ups and record payment references.</li>
          <li>To prevent fraud, abuse, and multiple-account manipulation.</li>
          <li>To provide support if you contact us.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Legal basis (UK GDPR)">
        <p>
          We process your personal data under the following lawful bases:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Performance of a contract</strong> — to run the account and
            betting features you signed up for.
          </li>
          <li>
            <strong>Legal obligation</strong> — to retain transaction records for
            accounting and dispute resolution.
          </li>
          <li>
            <strong>Legitimate interests</strong> — for security, fraud
            prevention, and service improvement.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Who we share data with">
        <p>
          We do not sell your data. We share it only with:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Stripe</strong> — to process card payments. See the{" "}
            <a
              href="https://stripe.com/privacy"
              className="font-bold text-brand-600 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Hosting providers</strong> — the infrastructure that runs the
            app and database.
          </li>
          <li>
            <strong>Authorities, if required by law</strong> — where we are
            legally compelled to disclose information.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How long we keep data">
        <p>
          We keep your account and transaction data for as long as your account is
          active. You can delete your account at any time from your{" "}
          <a href="/profile" className="font-bold text-brand-600 hover:underline">
            profile settings
          </a>
          , which removes your personal data. Transaction records may be retained
          for longer where required for accounting or legal purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>Under UK data protection law, you have the right to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate or incomplete data.</li>
          <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
          <li>Object to or restrict certain processing.</li>
          <li>Receive a copy of your data in a portable format.</li>
          <li>Withdraw consent where processing relies on it.</li>
        </ul>
        <p>
          To exercise any of these rights,{" "}
          <a href="mailto:privacy@betwfriends.app" className="font-bold text-brand-600 hover:underline">
            contact us
          </a>
          . If you are unhappy with how we handle your data, you can complain to
          the{" "}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="font-bold text-brand-600 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Information Commissioner&rsquo;s Office (ICO)
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          We take reasonable measures to protect your data: passwords are hashed
          with bcrypt, sessions use signed JWT cookies with secure flags, and all
          traffic is served over HTTPS in production. No method of transmission or
          storage is fully secure, but we work to protect your information.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          BetWFriends is for adults aged 18 and over only. We do not knowingly
          collect data from anyone under 18. If you believe a minor has registered,
          please{" "}
          <a href="mailto:support@betwfriends.app" className="font-bold text-brand-600 hover:underline">
            contact us
          </a>{" "}
          and we will remove the account.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          We may update this policy as the service evolves. We will note the
          &ldquo;last updated&rdquo; date above whenever we make material changes.
          Continued use after changes take effect means you accept the updated
          policy.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy or your data? Email{" "}
          <a href="mailto:privacy@betwfriends.app" className="font-bold text-brand-600 hover:underline">
            privacy@betwfriends.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
