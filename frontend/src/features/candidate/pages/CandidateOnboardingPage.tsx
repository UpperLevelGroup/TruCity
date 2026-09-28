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
     */
    localStorage.setItem(
      ONBOARDING_COMPLETE_KEY,
      'true',
    );

  
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
