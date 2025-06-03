import React from 'react';

// Inline styles for the Footer
const footerStyle = {
  backgroundColor: '#e9ecef', // Light grey, similar to secondary button
  color: '#495057', // Dark grey text
  padding: '1.5rem 0', // Vertical padding
  textAlign: 'center',
  borderTop: '1px solid #ced4da', // Subtle top border
  marginTop: 'auto', // Pushes footer to the bottom of the flex container in App.js
};

const textStyle = {
  margin: 0,
  fontSize: '0.9rem',
};

function Footer() {
  return (
    <footer style={footerStyle}>
      <div className="container">
        <p style={textStyle}>© {new Date().getFullYear()} Football Transfer System. All rights reserved.</p>
        {/* You can add more links or information here if needed */}
      </div>
    </footer>
  );
}

export default Footer;
