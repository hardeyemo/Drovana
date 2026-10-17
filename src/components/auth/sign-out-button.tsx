import { signOutAction } from "@/app/auth/actions";

export function SignOutButton() {
  return <form action={signOutAction}><button className="rounded-full border border-[#dfe3dc] px-4 py-2 text-sm font-semibold text-[#526557] hover:bg-[#f4f5ef]">Sign out</button></form>;
}
