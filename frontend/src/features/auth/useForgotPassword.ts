import { useState } from 'react';
import type { FormEvent } from 'react';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // TODO: Add your backend API call here (e.g., await supabase.auth.resetPasswordForEmail(email))
    
    setSubmitted(true);
  };

  return {
    email,
    setEmail,
    submitted,
    handleSubmit,
  };
}