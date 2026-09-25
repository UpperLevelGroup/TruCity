import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export type PlanId =
  | 'general'
  | 'skilled';

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  amount: number;
  period: string;
  description: string;
  icon: LucideIcon;
};

export const PLANS: Plan[] = [
  {
    id: 'general',
    name: 'Verified General Candidate',
    price: 'R10',
    amount: 10,
    period: '/ month',
    description:
      'Show employers that your general profile details and identity have been verified.',
    icon: UserCheck,
  },
  {
    id: 'skilled',
    name: 'Verified Skilled Candidate',
    price: 'R15',
    amount: 15,
    period: '/ month',
    description:
      'Highlight your verified skills, experience, and certifications to stand out to top employers.',
    icon: ShieldCheck,
  },
];

export function useChoosePlan() {
  const navigate =
    useNavigate();

  const [
    selectedPlan,
    setSelectedPlan,
  ] =
    useState<PlanId | null>(
      null,
    );

  const selectedPlanDetails =
    PLANS.find(
      (plan) =>
        plan.id ===
        selectedPlan,
    ) ?? null;

  const continueToFeed = () => {
    if (
      !selectedPlan
    ) {
      return;
    }

    sessionStorage.setItem(
      'candidatePlan',
      selectedPlan,
    );

    navigate(
      '/candidate/cv',
    );
  };

  return {
    selectedPlan,
    selectedPlanDetails,
    setSelectedPlan,
    continueToFeed,
    PLANS,
  };
}