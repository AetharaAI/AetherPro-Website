// src/pages/SecurityPage.tsx

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

const SecurityPage: React.FC = () => {
  return (
    <div style={pageStyles}>
      <h1 style={headingStyles}>Security at AetherPro</h1>
      <p>
        The security of our systems and the protection of your data is a top priority at AetherPro. We have implemented a multi-layered security strategy to ensure the integrity, confidentiality, and availability of our services.
      </p>

      <h2 style={headingStyles}>Data Encryption</h2>
      <ul>
        <li>
          <strong>In Transit:</strong> All data transmitted between you and our services is encrypted using industry-standard TLS 1.2 or higher.
        </li>
        <li>
          <strong>At Rest:</strong> Your data, including prompts and uploaded files, is encrypted at rest using AES-256, one of the strongest block ciphers available.
        </li>
      </ul>

      <h2 style={headingStyles}>Infrastructure and Network Security</h2>
      <ul>
        <li>Our services are hosted on leading cloud infrastructure providers that comply with a wide range of international security standards.</li>
        <li>We employ firewalls, network segmentation, and intrusion detection systems to protect our infrastructure from unauthorized access.</li>
        <li>Regular vulnerability scanning and penetration testing are conducted to identify and remediate potential threats.</li>
      </ul>

      <h2 style={headingStyles}>Access Control</h2>
      <ul>
        <li>We adhere to the principle of least privilege, ensuring that our employees only have access to the data necessary to perform their job functions.</li>
        <li>Multi-Factor Authentication (MFA) is enforced for all internal systems.</li>
      </ul>

      <h2 style={headingStyles}>Secure Development Lifecycle</h2>
      <ul>
        <li>Our development process includes security reviews, static and dynamic code analysis, and dependency scanning to mitigate vulnerabilities before they reach production.</li>
      </ul>

      <h2 style={headingStyles}>Responsible Disclosure</h2>
      <p>
        If you believe you have discovered a security vulnerability in our services, please let us know. We are committed to working with the security community to resolve issues. Please report any findings to: <strong>security@aetherprotech.com</strong>.
      </p>
    </div>
  );
};

export default SecurityPage;