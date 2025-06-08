import { CheckIcon } from "@heroicons/react/24/outline";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - Synergetics ZappForm",
  description: "Choose a plan that works for you.",
};

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/auth/register",
    price: { monthly: "$0", annually: "$0" },
    description: "Perfect for trying out Synergetics ZappForm.",
    features: [
      "5 form submissions per month",
      "Basic AI suggestions",
      "Store up to 10 personal data fields",
      "Standard email support",
    ],
    mostPopular: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/auth/register?plan=pro",
    price: { monthly: "$12", annually: "$120" },
    description: "For professionals and power users.",
    features: [
      "Unlimited form submissions",
      "Advanced AI suggestions",
      "Unlimited personal data fields",
      "Document upload and data extraction",
      "Priority email support",
    ],
    mostPopular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Pricing Plans
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Start filling forms faster with Synergetics ZappForm. Choose the plan that
            works best for you.
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 dark:bg-gray-800 dark:ring-white/10 sm:p-10 ${
                tier.mostPopular ? "lg:z-10 lg:scale-105" : ""
              }`}
            >
              <div>
                <h3
                  id={tier.id}
                  className="text-base font-semibold leading-7 text-blue-600"
                >
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {tier.price.monthly}
                  </span>
                  <span className="text-base font-semibold leading-7 text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className="mt-10 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-400"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-blue-600"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3.5 py-2 text-center text-sm font-semibold leading-6 ${
                  tier.mostPopular
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    : "text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 dark:ring-blue-800 dark:hover:ring-blue-700"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10 dark:divide-white/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 md:space-y-0">
            <div>
              <dt className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                What is Synergetics ZappForm?
              </dt>
              <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Synergetics ZappForm is an AI-powered tool that automatically fills out web
                forms for you, saving you time and reducing repetitive data
                entry.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                How does Synergetics ZappForm protect my privacy?
              </dt>
              <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Synergetics ZappForm processes all your information locally on your device. Your
                personal data is encrypted and never sent to our servers unless
                you explicitly choose to sync across devices, in which case we
                use end-to-end encryption.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Can I try Synergetics ZappForm before purchasing?
              </dt>
              <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Yes! Our Free tier allows you to use basic Synergetics ZappForm features
                with some limits. All paid plans also come with a 14-day free
                trial, no credit card required.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                How accurate is the AI form detection?
              </dt>
              <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Our AI has been trained on millions of forms and achieves over
                98% accuracy in detecting and filling standard form fields. The
                system continuously improves as it learns from usage patterns.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 