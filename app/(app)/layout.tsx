import { requireUser, publicUser } from "@/lib/session";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const pub = publicUser(user);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={pub} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
