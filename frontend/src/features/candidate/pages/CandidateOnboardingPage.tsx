import { useNavigate } from 'react-router-dom';

import CandidateOnboarding from './CandidateOnboarding';

const ONBOARDING_COMPLETE_KEY =
  'trucity-candidate-onboarding-complete';

export default function CandidateOnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    /*
     * =====================================================
     * MARK ONBOARDING AS COMPLETE
     * =====================================================
     *
     * This prevents the existing CandidateLayout logic
     * from showing onboarding again.
     */
    localStorage.setItem(
      ONBOARDING_COMPLETE_KEY,
      'true',
    );

    /*
     * =====================================================
     * CONTINUE TO PROFILE SETUP
     * =====================================================
     *
     * The registration details saved by
     * candidateRegistrationStorage remain available in
     * sessionStorage for ProfileSetup to use.
     */
    navigate(
      '/candidate/profile/setup',
      {
        replace: true,
      },
    );
  };

  return (
    <CandidateOnboarding
      onComplete={handleComplete}
    />
  );
}
