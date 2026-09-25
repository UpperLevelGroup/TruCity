import {
  Outlet,
} from 'react-router-dom';

import { useState } from 'react';

import { CandidateNavBar } from './CandidateNavBar';
import CandidateOnboarding from '../pages/CandidateOnboarding';

import {
  NotificationsProvider,
} from '../../../context/NotificationsContext';

const ONBOARDING_STORAGE_KEY =
  'trucity-candidate-onboarding-complete';

/* =========================================================
   NAVIGATION
========================================================= */

const fullAccessTabs = [
  {
    to: '/candidate/feed',
    label: 'Home',
    icon: 'home',
  },
  {
    to: '/candidate/messages',
    label: 'Messages',
    icon: 'messages',
  },
  {
    to: '/candidate/hub',
    label: 'Guidance Hub',
    icon: 'hub',
  },
  {
    to: '/candidate/cv',
    label: 'CV',
    icon: 'cv',
  },
  {
    to: '/candidate/profile',
    label: 'Profile',
    icon: 'profile',
  },
];

export default function CandidateLayout() {
  /* =========================================================
     FIRST-TIME ONBOARDING STATE
  ========================================================= */

  const [
    showOnboarding,
    setShowOnboarding,
  ] = useState(() => {
    return (
      localStorage.getItem(
        ONBOARDING_STORAGE_KEY,
      ) !== 'true'
    );
  });

  /* =========================================================
     ONBOARDING COMPLETE
  ========================================================= */

  const handleOnboardingComplete =
    () => {
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        'true',
      );

      setShowOnboarding(false);
    };

  /* =========================================================
     LAYOUT
  ========================================================= */

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
        {/* ===================================================
            SHARED CANDIDATE NAVBAR
        ==================================================== */}

        <CandidateNavBar
          tabs={fullAccessTabs}
        />

        {/* ===================================================
            PAGE CONTENT

            Transparent so the global AppWatermark remains
            visible behind candidate pages.
        ==================================================== */}

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
            pt-[112px]

            sm:px-6
            lg:px-8
          "
        >
          <Outlet />
        </main>

        {/* ===================================================
            FOOTER

            Semi-transparent so the global skyline does not
            disappear behind a solid white strip.
        ==================================================== */}

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
              ©{' '}
              {new Date().getFullYear()}{' '}
              UpperLevel Group. All rights
              reserved.
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
              <span>
                Privacy Policy
              </span>

              <span>
                Terms of Service
              </span>

              <span>
                Support
              </span>
            </div>
          </div>
        </footer>

        {/* ===================================================
            FIRST-TIME USER ONBOARDING
        ==================================================== */}

        {showOnboarding && (
          <CandidateOnboarding
            onComplete={
              handleOnboardingComplete
            }
          />
        )}
      </div>
    </NotificationsProvider>
  );
}
