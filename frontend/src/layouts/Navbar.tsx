import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-logo">
          Tru<span>City</span>
        </Link>

        <nav className="navbar-nav">

          <Link to="/login" className="navbar-link">
            Sign in
          </Link>

          <Link
            to="/register"
            className="navbar-join"
          >
            Join TruCity
          </Link>

        </nav>

      </div>
    </header>
  );
}