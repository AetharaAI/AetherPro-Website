// src/pages/TermsPage.tsx

import React from 'react';

const pageStyles: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem',
  lineHeight: '1.6',
  color: '#333',
};

const headingStyles: React.CSSProperties = {
  color: '#111',
  borderBottom: '2px solid #eee',
  paddingBottom: '0.5rem',
  marginBottom: '1rem',
};

const TermsPage: React.FC = () => {
  return (
    <div style={pageStyles}>
      <h1 style={headingStyles}>Terms of Service</h1>
      <p><strong>Last Updated:</strong> June 10, 2025</p>

      <p>
        These Terms of Service ("Terms") govern your access to and use of the AetherPro website and services (the "Services"). Please read these Terms carefully. By using our Services, you agree to be bound by these Terms.
      </p>

      <h2 style={headingStyles}>1. Use of Services</h2>
      <p>
        You must be at least 13 years old to use the Services. You are responsible for your account and all activity that occurs under it. You must comply with all applicable laws and our Acceptable Use Policy.
      </p>
      
      <h2 style={headingStyles}>2. Acceptable Use</h2>
      <p>You agree not to use the Services to:</p>
      <ul>
        <li>Generate content that is illegal, harmful, or violates the rights of others.</li>
        <li>Attempt to reverse-engineer, decompile, or discover the source code of our models or systems.</li>
        <li>Misrepresent that output from the Services was human-generated.</li>
        <li>Interfere with or disrupt the Services.</li>
      </ul>

      <h2 style={headingStyles}>3. Content and Intellectual Property</h2>
      <ul>
        <li>
          <strong>Your Input:</strong> You retain all ownership rights to the content you submit to the Services ("Input"). You grant us a worldwide, non-exclusive license to use your Input to provide and improve the Services.
        </li>
        <li>
          <strong>Our Output:</strong> Subject to your compliance with these Terms, AetherPro grants you a worldwide, non-exclusive, royalty-free license to use, reproduce, and create derivative works from the AI-generated responses ("Output") for any purpose, including commercial use.
        </li>
        <li>
          <strong>Our Property:</strong> The Services, including our website, models, and branding, are the exclusive property of AetherPro and its licensors.
        </li>
      </ul>

      <h2 style={headingStyles}>4. Disclaimers and Limitation of Liability</h2>
      <p>
        THE SERVICES ARE PROVIDED "AS IS." WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF THE OUTPUT. IN NO EVENT SHALL AETHERPRO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
      </p>

      <h2 style={headingStyles}>5. Termination</h2>
      <p>
        We may suspend or terminate your access to the Services at any time, for any reason, including for violation of these Terms.
      </p>

      <h2 style={headingStyles}>6. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at: <strong>legal@aetherprotech.com</strong>.</p>
    </div>
  );
};

export default TermsPage;