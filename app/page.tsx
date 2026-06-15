import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { getCurrentUser } from "@/lib/session";

const BET_STORIES = [
  {
    title: "Who'll flinch first on the ride?",
    stake: "£5 stakes · 6 friends",
    tag: "Theme park Saturday",
    color: "text-brand-600",
    tagColor: "bg-brand-100 text-brand-700",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85",
    position: "50% 34%",
  },
  {
    title: "Who's cooking Sunday lunch?",
    stake: "£10 stakes · 5 friends",
    tag: "Loser buys the ingredients",
    color: "text-berry",
    tagColor: "bg-pink-100 text-pink-700",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=85",
    position: "50% 45%",
  },
  {
    title: "Will Arsenal beat Spurs at home?",
    stake: "£20 stakes · 10 friends",
    tag: "North London Derby",
    color: "text-teal",
    tagColor: "bg-teal-100 text-teal-700",
    image:
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=700&q=85",
    position: "50% 35%",
  },
  {
    title: "Who's most likely to move abroad?",
    stake: "£5 stakes · 7 friends",
    tag: "Trip paid by the loser",
    color: "text-grape",
    tagColor: "bg-violet-100 text-violet-700",
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=700&q=85",
    position: "50% 45%",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Create a bet",
    text: "Pick a question, set the stakes and invite your friends.",
    color: "bg-brand-500",
  },
  {
    number: "2",
    title: "Everyone picks",
    text: "Your mates place their picks. Banter is encouraged.",
    color: "bg-berry",
  },
  {
    number: "3",
    title: "Let it play out",
    text: "We'll keep it fair, transparent and up to date.",
    color: "bg-teal",
  },
  {
    number: "4",
    title: "Settle & celebrate",
    text: "Winner takes it. Loser pays up. On to the next one.",
    color: "bg-grape",
  },
];

const TESTIMONIALS = [
  {
    quote: "The banter is 10x better when there's a little something on it.",
    group: "Jack & the lads",
    detail: "Football fanatics",
    win: "Won £60",
    tone: "text-brand-600",
  },
  {
    quote: "We do a bet for every games night. It's become a ritual.",
    group: "The Boardroom",
    detail: "Game night crew",
    win: "Won £45",
    tone: "text-berry",
  },
  {
    quote: "Finally an app that keeps it between friends. No weird fees. Just fun.",
    group: "Sophie & co.",
    detail: "Travel addicts",
    win: "Won £30",
    tone: "text-teal",
  },
];

const FAQS = [
  {
    question: "Is this gambling?",
    answer:
      "betwfriends is a private social pot between friends. There is no bookmaker, no odds-setting house and no rake.",
  },
  {
    question: "Where does the money go?",
    answer:
      "Every stake goes into the shared pot. When the bet is settled, the winners split it transparently.",
  },
  {
    question: "Can people keep it low stakes?",
    answer:
      "Yes. The app is designed for small, friendly bets, clear limits and groups of people who already know each other.",
  },
];

const MARKETING_LINKS = [
  { href: "#bets", label: "Ideas" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#stories", label: "Stories" },
  { href: "#safety", label: "Safety" },
  { href: "#faq", label: "FAQ" },
];

const FACE_IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=96&h=96&q=80",
];

function Underline({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block text-berry">
      {children}
      <span className="absolute -bottom-1 left-0 h-1 w-full -rotate-2 rounded-full bg-berry" />
    </span>
  );
}

function MarketingFaceStack({
  offset,
  names,
}: {
  offset: number;
  names: string[];
}) {
  return (
    <span className="inline-flex items-center">
      {names.map((name, index) => (
        <span
          key={name}
          className={`relative block h-6 w-6 overflow-hidden rounded-full bg-brand-100 ring-2 ring-white ${
            index === 0 ? "" : "-ml-2"
          }`}
          title={name}
        >
          <Image
            src={FACE_IMAGES[offset + index]}
            alt={name}
            fill
            sizes="24px"
            className="object-cover"
          />
        </span>
      ))}
    </span>
  );
}

function LiveBetCard() {
  const options = [
    {
      name: "The Smart Guys",
      score: "2.25",
      color: "bg-brand-500",
      faces: ["Tom", "Tariq", "Theo"],
    },
    {
      name: "Quiz Queens",
      score: "3.40",
      color: "bg-berry",
      faces: ["Quinn", "Grace", "Tia"],
    },
    {
      name: "Dark Horse Detectives",
      score: "6.75",
      color: "bg-teal",
      faces: ["Dani", "Chris", "Maya"],
    },
  ];

  return (
    <div
      data-hero-bet-card
      className="relative z-20 w-full max-w-[390px] rounded-[1.65rem] bg-white p-5 shadow-[0_24px_70px_-24px_rgba(45,27,105,0.35)] ring-1 ring-brand-100/70 sm:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-berry">
          Live bet
        </span>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal">
          Closes in 2h 47m
        </span>
      </div>
      <h2 className="mt-6 text-2xl font-black leading-tight">
        Who's winning pub quiz this Saturday?
      </h2>
      <p className="mt-2 text-xs font-semibold text-ink-soft">£10 entry · 8 people</p>
      <div className="mt-6 space-y-2.5">
        {options.map((option, index) => (
          <div
            key={option.name}
            className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-3"
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black text-white ${option.color}`}
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm font-bold">{option.name}</span>
            <MarketingFaceStack offset={index * 3} names={option.faces} />
            <span className={`rounded-lg px-2.5 py-2 text-xs font-extrabold text-white ${option.color}`}>
              {option.score}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-brand-100 pt-5">
        <p className="text-xs text-ink-soft">
          Your pick: <strong className="text-berry">Quiz Queens</strong>
        </p>
        <Link
          href="/register"
          className="rounded-xl border border-brand-300 px-4 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
        >
          View bet
        </Link>
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <main className="overflow-hidden bg-[#fffefe]">
      <header className="relative z-50 mx-auto flex w-full max-w-[1380px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink-soft lg:flex">
          {MARKETING_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-brand-600">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          {user ? (
            <Link href="/dashboard" className="btn-primary px-5 py-2.5 text-sm">
              Go to app
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-xl border border-brand-200 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-brand-50 sm:inline-flex">
                Log in
              </Link>
              <Link href="/register" className="btn-primary rounded-xl px-5 py-2.5 text-sm">
                Create a bet
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative mx-auto grid w-full max-w-[1380px] items-center gap-8 px-5 pb-20 pt-12 sm:min-h-[850px] sm:gap-12 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:pb-28 lg:pt-20">
        <div className="relative z-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">
            Friends only. Real fun.
          </p>
          <h1 className="mt-7 max-w-[620px] text-[3.65rem] font-black leading-[0.98] tracking-[-0.065em] text-ink sm:text-[5.1rem] lg:text-[5.8rem]">
            Put your money where your <Underline>mate</Underline> is.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
            BetWFriends is the social betting app for your friends. Low stakes.
            Big banter. No bookies. No BS.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/register" className="btn-primary rounded-xl px-7 py-4">
              Create a bet <span aria-hidden="true">→</span>
            </Link>
            <a href="#how-it-works" className="group inline-flex items-center gap-3 text-sm font-bold text-ink-soft">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-brand-300 text-xs text-brand-600 transition group-hover:bg-brand-50">
                ▶
              </span>
              See how it works
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-ink-soft">
            {["Friends only", "No bookmaker", "No house edge"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-teal text-[9px] font-black text-teal">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[520px] items-center justify-center sm:min-h-[590px]">
          <div className="absolute left-[20%] top-[2%] h-[88%] w-[58%] rotate-6 rounded-[46%_54%_42%_58%/58%_44%_56%_42%] bg-gradient-to-br from-brand-300 via-grape to-berry opacity-85" />
          <div
            data-hero-photo
            className="absolute bottom-[2%] right-0 hidden h-[68%] w-[38%] overflow-hidden rounded-[2.5rem] shadow-2xl md:block"
          >
            <Image
              src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=90"
              alt="Friends laughing together at a pub quiz"
              fill
              priority
              sizes="(max-width: 1024px) 70vw, 32vw"
              className="object-cover"
            />
          </div>
          <div className="relative z-20 md:absolute md:left-0 md:max-w-[390px] lg:left-[2%]">
            <LiveBetCard />
          </div>
        </div>
      </section>

      <section id="bets" className="border-y border-brand-100/70 bg-canvas/45 pt-20 sm:pt-24">
        <div className="mx-auto w-full max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            Some bets are made for <Underline>mates</Underline>.
          </h2>
          <div className="mt-12 grid gap-y-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {BET_STORIES.map((bet) => (
              <article
                key={bet.title}
                className="relative flex min-h-[560px] flex-col overflow-hidden border-brand-100 px-0 md:px-6 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <h3 className={`max-w-[270px] text-4xl font-black leading-[1.02] tracking-[-0.05em] ${bet.color}`}>
                  {bet.title}
                </h3>
                <p className="mt-5 text-sm font-semibold text-ink-soft">{bet.stake}</p>
                <span className={`mt-5 w-fit rounded-xl px-3 py-2 text-xs font-bold ${bet.tagColor}`}>
                  {bet.tag}
                </span>
                <div className="relative mt-auto h-60 w-full overflow-hidden rounded-t-[5rem]">
                  <Image
                    src={bet.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                    style={{ objectPosition: bet.position }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto grid w-full max-w-[1380px] gap-12 px-5 py-18 sm:px-8 lg:grid-cols-[0.55fr_1.45fr] lg:px-12 lg:py-16">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">How it works</p>
          <h2 className="mt-5 text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl">
            Bets between friends. <Underline>Simple.</Underline>
          </h2>
        </div>
        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <div className="absolute left-[8%] right-[8%] top-5 hidden border-t border-dashed border-brand-200 lg:block" />
          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center">
              <span className={`relative z-10 mx-auto grid h-11 w-11 place-items-center rounded-full text-sm font-black text-white shadow-lg ${step.color}`}>
                {step.number}
              </span>
              <h3 className="mt-7 text-sm font-black">{step.title}</h3>
              <p className="mx-auto mt-3 max-w-40 text-xs leading-relaxed text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stories" className="bg-canvas/55 py-16">
        <div className="mx-auto grid w-full max-w-[1380px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.55fr_1.45fr] lg:px-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Real friends. Real stories.</p>
            <h2 className="mt-5 max-w-[360px] text-5xl font-black leading-[1.05] tracking-[-0.055em]">
              More laughs. More bragging rights.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <article key={item.group} className="flex min-h-[280px] flex-col rounded-2xl bg-white p-7 shadow-[0_15px_45px_-30px_rgba(45,27,105,0.3)] ring-1 ring-brand-100/60">
                <span className={`text-4xl font-black ${item.tone}`}>“</span>
                <blockquote className="mt-4 text-lg font-bold leading-relaxed">{item.quote}</blockquote>
                <div className="mt-auto flex items-end justify-between gap-3 pt-8">
                  <div>
                    <p className="text-xs font-black">{item.group}</p>
                    <p className="mt-1 text-[11px] text-ink-soft">{item.detail}</p>
                    <div className="mt-3">
                      <MarketingFaceStack
                        offset={9 + TESTIMONIALS.indexOf(item) * 4}
                        names={
                          TESTIMONIALS.indexOf(item) === 0
                            ? ["Jack", "Owen", "Liam", "Finn"]
                            : TESTIMONIALS.indexOf(item) === 1
                              ? ["Tara", "Nina", "Cole", "Iris"]
                              : ["Sophie", "Celeste", "Rina", "Faye"]
                        }
                      />
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-black text-brand-600">{item.win}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="mx-auto w-full max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-8 rounded-[1.75rem] bg-gradient-to-r from-teal-50 via-white to-brand-50 px-7 py-8 ring-1 ring-teal-100 sm:px-10 lg:grid-cols-[1.15fr_2fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-black">Playful by design.<br />Responsible by default.</h2>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-ink-soft">
              BetWFriends is about fun and friendly competition. We encourage respectful banter, clear boundaries and looking out for your mates.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["Set your own limits", "Only bet what you're comfortable with."],
              ["Take a break", "Pause or step back anytime."],
              ["Look out for friends", "If something's not right, reach out."],
            ].map(([title, text]) => (
              <div key={title}>
                <p className="text-xs font-black text-ink">{title}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto grid w-full max-w-[1380px] gap-8 px-5 pb-12 sm:px-8 lg:grid-cols-[0.55fr_1.45fr] lg:px-12">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">
            No weird stuff
          </p>
          <h2 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-0.055em] sm:text-5xl">
            Clear rules before the first stake.
          </h2>
        </div>
        <div className="divide-y divide-brand-100 rounded-[1.75rem] bg-white px-6 ring-1 ring-brand-100/80">
          {FAQS.map((item) => (
            <div key={item.question} className="grid gap-2 py-6 sm:grid-cols-[0.65fr_1fr] sm:gap-8">
              <h3 className="text-base font-black">{item.question}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1380px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="relative grid min-h-[290px] overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-600 via-grape to-berry px-8 py-10 text-white sm:px-12 lg:grid-cols-[0.8fr_1fr_0.9fr] lg:items-center">
          <div className="absolute -bottom-24 right-[12%] h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <h2 className="relative text-4xl font-black leading-[1.03] tracking-[-0.05em] sm:text-5xl">
            Your mates.<br />Your bets.<br />Your rules.
          </h2>
          <div className="relative mt-8 lg:mt-0">
            <p className="text-lg font-black">Ready to start the banter?</p>
            <p className="mt-2 text-sm text-white/75">Create your first bet in less than a minute.</p>
            <Link href="/register" className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-black text-brand-700 shadow-xl transition hover:scale-[1.02]">
              Create a bet <span className="ml-3">→</span>
            </Link>
          </div>
          <div className="relative mt-8 h-52 overflow-hidden rounded-[2rem] lg:mt-0">
            <Image
              src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=90"
              alt="Friends sharing a laugh"
              fill
              sizes="(max-width: 1024px) 100vw, 30vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-[1380px] flex-col items-center justify-between gap-5 px-5 py-8 text-xs text-ink-soft sm:px-8 md:flex-row lg:px-12">
        <Logo size="sm" />
        <div className="flex flex-wrap justify-center gap-5">
          {MARKETING_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <p>18+ · Play responsibly · © {new Date().getFullYear()} BetWFriends</p>
      </footer>
    </main>
  );
}
