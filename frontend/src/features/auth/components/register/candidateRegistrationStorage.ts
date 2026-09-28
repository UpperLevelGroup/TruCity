export interface PendingCandidateRegistration {
  firstName: string;
  lastName: string;
  email: string;
}

const STORAGE_KEY =
  'trucity-pending-candidate-registration';

export function savePendingCandidateRegistration(
  data: PendingCandidateRegistration,
): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data),
    );
  } catch (error) {
    console.error(
      'Unable to save pending candidate registration:',
      error,
    );
  }
}

export function getPendingCandidateRegistration():
  | PendingCandidateRegistration
  | null {
  try {
    const stored =
      sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== 'object'
    ) {
      return null;
    }

    const value =
      parsed as Partial<PendingCandidateRegistration>;

    if (
      typeof value.firstName !== 'string' ||
      typeof value.lastName !== 'string' ||
      typeof value.email !== 'string'
    ) {
      return null;
    }

    return {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
    };
  } catch (error) {
    console.error(
      'Unable to read pending candidate registration:',
      error,
    );

    return null;
  }
}

export function clearPendingCandidateRegistration(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      'Unable to clear pending candidate registration:',
      error,
    );
  }
}
