import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Flag,
  Route,
  ShieldAlert,
  TrafficCone,
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureCards = [
  {
    title: "Report Incidents",
    description:
      "Capture citizen-reported disruptions, crowd build-up, and road hazards in real time.",
    icon: Flag,
  },
  {
    title: "Predict Impact",
    description:
      "Estimate congestion severity, delay, and spread before field conditions escalate.",
    icon: BrainCircuit,
  },
  {
    title: "Resource Allocation",
    description:
      "Coordinate officers, barricades, marshals, and tow support from one control surface.",
    icon: TrafficCone,
  },
  {
    title: "Diversion Planning",
    description:
      "Compare alternate routes and activate response plans for high-pressure corridors.",
    icon: Route,
  },
];

const workflowSteps = [
  "Citizen Report",
  "ML Impact Prediction",
  "Officer Verification",
  "Resource Deployment",
  "Diversion Activation",
];

export async function HeroSection() {
  const clerkUser = await currentUser();

  let dbUser = null;

  if (clerkUser?.id) {
    dbUser = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        role: true,
        username: true,
      },
    });
  }

  const primaryCta =
    dbUser?.role === "OFFICER"
      ? {
          label: "Open Command Center",
          href: "/dashboard",
          helper:
            "Jump directly into the operational dashboard, field planning, and response modules.",
        }
      : dbUser?.role === "USER"
        ? {
            label: "Report Incident",
            href: "/report-incident",
            helper:
              "Submit a traffic issue, crowd surge, blockage, or disruption for officer review.",
          }
        : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="rounded-3xl border border-[#343A40] bg-[#16181B] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#343A40] bg-[#1C1F23] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-[#F59E0B]">
              <ShieldAlert className="h-3.5 w-3.5" />
              City Traffic Operations
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Event-Driven Traffic Intelligence Platform
              </h1>

              <p className="max-w-3xl text-base leading-7 text-[#A1A7B3] sm:text-lg">
                Forecast congestion, coordinate field deployment, and crowdsource incident reporting for faster response.
              </p>
            </div>

            {primaryCta ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link href={primaryCta.href}>
                      {primaryCta.label}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/my-reports">My Reports</Link>
                  </Button>
                </div>

                <p className="text-sm leading-6 text-[#A1A7B3]">
                  {primaryCta.helper}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <SignInButton mode="modal">
                    <Button size="lg">
                      Get Started
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <Button variant="secondary" size="lg">
                      Create Account
                    </Button>
                  </SignUpButton>
                </div>

                <p className="text-sm leading-6 text-[#A1A7B3]">
                  Sign in with the existing Clerk flow to continue as a citizen reporter or operations officer.
                </p>
              </div>
            )}
          </div>

          <Card className="border-[#343A40] bg-[#1C1F23]">
            <CardHeader>
              <CardDescription className="text-[#F59E0B]">
                Platform focus
              </CardDescription>
              <CardTitle className="text-white">
                Operational visibility across reporting, prediction, verification, and response
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-[#A1A7B3]">
              <div className="rounded-2xl border border-[#343A40] bg-[#16181B] px-4 py-3">
                Built for planned events, sudden gatherings, construction, and traffic incidents.
              </div>
              <div className="rounded-2xl border border-[#343A40] bg-[#16181B] px-4 py-3">
                Citizens surface on-ground issues; officers validate, prioritize, and dispatch action.
              </div>
              <div className="rounded-2xl border border-[#343A40] bg-[#16181B] px-4 py-3">
                Dashboard, predictor, resources, diversions, and map modules remain available unchanged.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="border-[#343A40] bg-[#1C1F23]"
            >
              <CardHeader className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#343A40] bg-[#16181B] text-[#F59E0B]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-white">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="leading-6 text-[#A1A7B3]">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="rounded-3xl border border-[#343A40] bg-[#16181B] px-6 py-8 sm:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#F59E0B]">
              Workflow
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Response pipeline from report to field action
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-[repeat(5,minmax(0,1fr))]">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-2xl border border-[#343A40] bg-[#1C1F23] px-4 py-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#4B5563] bg-[#16181B] text-sm font-semibold text-[#F59E0B]">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-[#E5E7EB]">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
