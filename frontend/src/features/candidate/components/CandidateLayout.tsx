import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

import { CandidateNavBar } from "./CandidateNavBar";
import CandidateOnboarding from "../pages/CandidateOnboarding";
import { NotificationsProvider } from "../../../context/NotificationsContext";

type CandidatePlan = "free" | "general" | "skilled";

const ONBOARDING_STORAGE_KEY =
  "trucity-candidate-onboarding-complete";

const fullAccessTabs = [
  {
    to: "/candidate",
    label: "Home",
    icon: "home",
  },
  {
    to: "/candidate/messages",
    label: "Messages",
    icon: "messages",
  },
  {
    to: "/candidate/hub",
    label: "Guidance Hub",
    icon: "hub",
  },
  {
    to: "/candidate/cv",
    label: "CV",
    icon: "cv",
  },
  {
    to: "/candidate/profile",
    label: "Profile",
    icon: "profile",
  },
];

const freePlanTabs = [
  {
    to: "/candidate",
    label: "Home",
    icon: "home",
  },
  {
    to: "/candidate/profile",
    label: "Profile",
    icon: "profile",
  },
];

export default function CandidateLayout() {
  const location = useLocation();

  const candidatePlan =
    sessionStorage.getItem("candidatePlan") as CandidatePlan | null;

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return (
      localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "true"
    );
  });

  const isFreePlan =
    candidatePlan === "free";

  const isFreePlanAllowedRoute =
    location.pathname === "/candidate" ||
    location.pathname === "/candidate/profile" ||
    location.pathname === "/candidate/notifications";

  if (
    isFreePlan &&
    !isFreePlanAllowedRoute
  ) {
    return (
      <Navigate
        to="/candidate"
        replace
      />
    );
  }

  const tabs =
    isFreePlan
      ? freePlanTabs
      : fullAccessTabs;

  const handleOnboardingComplete = () => {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      "true"
    );

    setShowOnboarding(false);
  };

  return (
    <NotificationsProvider>
      <div
        className="
          relative
          min-h-screen
          min-h-[100dvh]
          bg-transparent
          text-brand-text
          antialiased
        "
      >
        <CandidateNavBar tabs={tabs} />

        {/*
          The navbar is fixed and exactly 88px high.

          This spacer reserves that exact amount of
          vertical space before the page content begins.
          It is intentionally separate from the main
          content so the Outlet can never slide behind
          the fixed header.
        */}
        <div
          aria-hidden="true"
          className="h-[88px] w-full"
        />

        <main
          className="
            relative
            z-10
            mx-auto
            min-h-[calc(100dvh-88px)]
            w-full
            max-w-7xl
            bg-transparent
            px-4
            pb-12
            sm:px-6
            lg:px-8
          "
        >
          <Outlet />
        </main>

        {isFreePlan && (
          <div
            className="
              relative
              z-20
              border-t
              border-brand-border/70
              bg-white/85
              px-4
              py-3
              text-center
              text-xs
              font-semibold
              text-brand-textMuted
              backdrop-blur-md
            "
          >
            You are currently on the{" "}
            <span className="font-bold text-brand-primary">
              Free Plan
            </span>
            . Upgrade to unlock full access.
          </div>
        )}

        <footer
          className="
            relative
            z-20
            border-t
            border-brand-border/70
            bg-white/80
            backdrop-blur-md
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              flex-col
              items-center
              justify-between
              gap-3
              px-5
              py-5
              text-xs
              text-brand-textMuted
              sm:flex-row
            "
          >
            <span>
              © {new Date().getFullYear()} UpperLevel Group.
              All rights reserved.
            </span>

            <div
              className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-5
              "
            >
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Support</span>
            </div>
          </div>
        </footer>

        {showOnboarding && (
          <CandidateOnboarding
            onComplete={handleOnboardingComplete}
          />
        )}
      </div>
    </NotificationsProvider>
  );
}