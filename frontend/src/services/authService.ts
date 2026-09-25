import {
  registerUser,
} from '../api/authApi';

type RegisterCandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function registerCandidate({
  firstName,
  lastName,
  email,
  password,
}: RegisterCandidateInput) {
  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanFirstName) {
    throw new Error('First name is required.');
  }

  if (!cleanLastName) {
    throw new Error('Last name is required.');
  }

  if (!cleanEmail) {
    throw new Error('Email address is required.');
  }

  if (!password) {
    throw new Error('Password is required.');
  }

  try {
    return await registerUser({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      password,
    });
  } catch (error: any) {
    console.error('Candidate registration error:', error);

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Could not create your account. Please try again.';

    throw new Error(message);
  }
}
