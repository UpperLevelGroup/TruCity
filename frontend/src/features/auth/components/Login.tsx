import { useState } from "react";
import type { CSSProperties, SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { C } from "../../../theme/colours";
import { loginUser } from "../../../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      console.log("LOGIN RESPONSE:", response);
      console.log("ACCESS TOKEN:", response.accessToken);
      console.log("ROLE:", response.role);

      if (!response.accessToken) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      const role = String(response.role ?? "")
        .trim()
        .toUpperCase();

      if (!role) {
        throw new Error(
          "Login succeeded but no user role was returned."
        );
      }

      // Store authentication information
      localStorage.setItem(
        "token",
        response.accessToken
      );

      localStorage.setItem(
        "role",
        role
      );

      console.log(
        "STORED TOKEN:",
        localStorage.getItem("token")
      );

      console.log(
        "STORED ROLE:",
        localStorage.getItem("role")
      );

      // Redirect based on the authenticated user's role
      switch (role) {
        case "ADMIN":
          navigate("/admin", {
            replace: true,
          });
          break;

        case "EMPLOYER":
          navigate("/company", {
            replace: true,
          });
          break;

        case "CANDIDATE":
          navigate("/candidate", {
            replace: true,
          });
          break;

        case "VERIFIER":
          navigate("/dashboard", {
            replace: true,
          });
          break;

        default:
          console.warn(
            "Unknown user role:",
            role
          );

          navigate("/dashboard", {
            replace: true,
          });
          break;
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Invalid email or password.";

      setError(
        typeof message === "string"
          ? message
          : "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>
          WELCOME BACK
        </div>

        <h2 style={styles.title}>
          Login to TruCity
        </h2>

        <p style={styles.subtitle}>
          Sign in to continue
        </p>

        <form
          style={styles.form}
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            style={styles.input}
            autoComplete="email"
            disabled={submitting}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            style={styles.input}
            autoComplete="current-password"
            disabled={submitting}
          />

          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={styles.link}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: C.bg,
    padding: "20px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  card: {
    backgroundColor: C.headerBg,
    color: "#ffffff",
    padding: "36px 32px",
    borderRadius: "16px",
    border: "1px solid #334155",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
  },

  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor:
      "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    marginBottom: "12px",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "22px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "0 0 24px 0",
    fontSize: "13px",
    color: "#94a3b8",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#ffffff",
    color: "black",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },

  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },

  footer: {
    marginTop: "15px",
    fontSize: "13px",
    color: "#94a3b8",
  },

  link: {
    color: "#38bdf8",
    textDecoration: "none",
    fontWeight: "600",
  },

  error: {
    color: "#f87171",
    backgroundColor:
      "rgba(248, 113, 113, 0.1)",
    border:
      "1px solid rgba(248, 113, 113, 0.2)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "12px",
    margin: "0",
    textAlign: "left",
  },
};