import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-logo">
          Tru<span>City</span>
        </Link>

        <nav className="navbar-nav">

          <Link to="/" className="navbar-link">
            Home
          </Link>

        </nav>

      </div>
    </header>
  );
}