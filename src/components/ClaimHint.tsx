import Link from "next/link";

export function ClaimHint({ email }: { email: string }) {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      We found a previous unlock for {email}.{" "}
      <Link
        href={`/register?email=${encodeURIComponent(email)}&next=/library`}
        className="font-medium underline"
      >
        Register
      </Link>
      {" "}or{" "}
      <Link
        href={`/login?email=${encodeURIComponent(email)}&next=/library`}
        className="font-medium underline"
      >
        sign in
      </Link>{" "}
      with that email to restore your purchases.
    </div>
  );
}
