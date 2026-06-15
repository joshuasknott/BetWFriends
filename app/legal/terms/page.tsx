import { LegalPage, LegalSection, legalMetadata } from "@/components/legal-page";

export const metadata = legalMetadata(
  "Terms of Service",
  "The terms and conditions for using BetWFriends.",
);

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="15 June 2026">
      <LegalSection>
        <p>
          Welcome to BetWFriends. These Terms of Service (&ldquo;Terms&rdquo;)
          govern your use of the BetWFriends website and app (the
          &ldquo;Service&rdquo;). By creating an account or using the Service, you
          agree to these Terms. If you do not agree, please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection heading="1. What BetWFriends is">
        <p>
          BetWFriends is a private social platform for making low-stakes wagers
          between friends. It is <strong>not a bookmaker, casino, or gambling
          operator</strong>. There is no house, no odds-setting, and no rake. The
          Service facilitates friendly wagers between people who already know each
          other, with stakes held in an internal wallet and paid out to the winners
          of each bet.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility">
        <p>
          You must be <strong>at least 18 years old</strong> to use this Service.
          By registering, you confirm that you are 18 or over and legally able to
          enter into these Terms. We may ask for proof of age and suspend accounts
          we believe belong to minors.
        </p>
        <p>
          BetWFriends is designed for small, social wagers among consenting
          adults who know each other. It is not intended for commercial use,
          professional gambling, or wagering beyond friendly stakes.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <p>
          You are responsible for keeping your password secure and for all
          activity under your account. You must provide accurate information at
          registration and keep it up to date. One account per person — creating
          multiple accounts to manipulate bets or balances is prohibited.
        </p>
        <p>
          You can delete your account at any time from your profile settings.
          Deleting your account forfeits any open wagers and any remaining wallet
          balance. See our{" "}
          <a href="/legal/privacy" className="font-bold text-brand-600 hover:underline">
            Privacy Policy
          </a>{" "}
          for how we handle your data.
        </p>
      </LegalSection>

      <LegalSection heading="4. Wallet, stakes, and payouts">
        <p>
          The Service uses an internal wallet. In demo mode, top-ups are free and
          instant. In live mode, you top up your wallet via card payment processed
          by Stripe. Stripe&rsquo;s fees may apply to top-ups; BetWFriends does not
          charge its own fees.
        </p>
        <p>
          <strong>Stakes are held in the shared bet pot</strong> while a bet is
          open. When the bet creator settles the bet, the pot is split
          proportionally among the winners based on their stake. If no one wins
          or the bet is cancelled, all stakes are refunded. BetWFriends does not
          take a cut.
        </p>
        <p>
          Balances are a record in our database, not a regulated financial
          product. The Service is not a bank, e-money issuer, or payment
          institution, and wallet balances are not covered by financial
          compensation schemes.
        </p>
      </LegalSection>

      <LegalSection heading="5. Settling disputes">
        <p>
          Bet creators are responsible for settling bets honestly and fairly. If
          you disagree with how a bet was settled, raise it with the bet creator
          or the group. BetWFriends does not adjudicate bet outcomes — the
          settlement is a social agreement between you and your friends.
        </p>
      </LegalSection>

      <LegalSection heading="6. Acceptable use">
        <p>You agree not to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>Use the Service if you are under 18.</li>
          <li>Create bets about illegal activities or that could cause harm.</li>
          <li>Harass, threaten, or abuse other users.</li>
          <li>Attempt to manipulate balances, bets, or payouts.</li>
          <li>Use bots, scripts, or automated tools to access the Service.</li>
          <li>Resell, charge others for, or commercialise access to the Service.</li>
          <li>Reverse-engineer, scrape, or overload the Service.</li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these rules. See also
          our{" "}
          <a href="/legal/responsible-play" className="font-bold text-brand-600 hover:underline">
            Responsible Play
          </a>{" "}
          page.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          BetWFriends is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;. To the maximum extent permitted by law, we are not
          liable for:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>Loss of wallet balance due to service outages, bugs, or data loss.</li>
          <li>Disputes between friends over how a bet was settled.</li>
          <li>Any indirect, incidental, or consequential damages arising from use
            of the Service.</li>
        </ul>
        <p>
          Our total liability for any claim is limited to the total amount you
          have topped up via card in the three months preceding the event giving
          rise to the claim.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to the Service and Terms">
        <p>
          We may update or change the Service at any time. We may also revise
          these Terms; material changes will be reflected in the
          &ldquo;last updated&rdquo; date. Continued use after changes take effect
          constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Termination">
        <p>
          You can stop using the Service and delete your account at any time. We
          may suspend or terminate your account if you breach these Terms or if we
          believe your activity is harmful to the Service or other users.
        </p>
      </LegalSection>

      <LegalSection heading="10. Governing law">
        <p>
          These Terms are governed by the laws of England and Wales. Any disputes
          will be subject to the exclusive jurisdiction of the courts of England
          and Wales.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:support@betwfriends.app" className="font-bold text-brand-600 hover:underline">
            support@betwfriends.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
