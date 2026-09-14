import { siteConfig } from "@/lib/site-config";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-950">Refund Policy</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: September 14, 2026</p>

      <div className="mt-6 space-y-4 text-ink-700 leading-relaxed">
        <p>
          {siteConfig.siteName} sells digital reading access (one-time novel unlocks and
          subscriptions). Because content is delivered immediately after payment, refunds are
          limited.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">1. One-time unlocks</h2>
        <p>
          If you cannot access purchased chapters due to a technical issue on our side, contact us
          within 14 days and we will help restore access or issue a refund where appropriate.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">2. Subscriptions</h2>
        <p>
          You may cancel a subscription to stop future renewals. Fees already charged for the
          current billing period are generally non-refundable, except where required by law or when
          we fail to deliver access.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">3. How to request a refund</h2>
        <p>
          Email{" "}
          <a href="mailto:19359932547@163.com" className="text-accent hover:underline">
            19359932547@163.com
          </a>{" "}
          with your purchase email, approximate purchase time, and a short description of the
          problem. Payments are processed by Paddle; approved refunds are returned through Paddle
          to your original payment method.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">4. Chargebacks</h2>
        <p>
          Please contact us before filing a chargeback so we can resolve access issues quickly.
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: `Refund Policy · ${siteConfig.siteName}`,
};
