import viteLogo from "/vite.svg";
import PropTypes from "prop-types"; // Import PropTypes for validation
import "./Header.css"; // For styling the header

const Header = ({ time }) => {
  return (
    <header className="header">
      <div className="logo-container">
        {/* Logo (can be an image or text) */}
        <a
          href="https://www.westpharma.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={viteLogo} className="logo" alt="logo" />
        </a>
        <h1 className="app-title">IoT Dashboard</h1>
      </div>
      {/* Conditionally render the last updated text */}
      {time && (
        <h1 className="app-sub-title">
          Last Updated At {new Date(parseInt(time)).toLocaleString()}
        </h1>
      )}
    </header>
  );
};

// Prop validation
Header.propTypes = {
  time: PropTypes.string, // Expecting `time` to be a string
};

export default Header;
