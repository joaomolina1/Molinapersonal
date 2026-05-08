import { requireUser } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar userEmail={user.email} />
      <main className="flex-1 px-3 sm:px-6 pt-4 pb-28 md:pb-10">
        <div className="mx-auto max-w-3xl w-full">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
