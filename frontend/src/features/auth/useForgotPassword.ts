import { useState } from "react";
import type { FormEvent } from "react";

import { forgotPassword } from "../../api/authApi";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    try {
      await forgotPassword({
        email: email.trim(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Password reset request failed:",
        error
      );

      setSubmitted(false);
    }
  };

  return {
    email,
    setEmail,
    submitted,
    handleSubmit,
  };
}