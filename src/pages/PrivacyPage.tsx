// src/pages/PrivacyPage.tsx

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

const PrivacyPage: React.FC = () => {
  return (
    <div style={pageStyles}>
      <h1 style={headingStyles}>Privacy Policy</h1>
      <p><strong>Last Updated:</strong> June 10, 2025</p>

      <p>
        Welcome to AetherPro. Your privacy is critically important to us. This Privacy Policy provides detailed information on how AetherPro ("we", "us", "our") collects, uses, and protects your information when you use our website, services, and the AetherPro AI Operating System (collectively, the "Services").
      </p>

      <h2 style={headingStyles}>1. Information We Collect</h2>
      <p>We collect information to provide and improve our Services. The types of information we collect include:</p>
      <ul>
        <li>
          <strong>Account Information:</strong> When you register for an account, we collect personal information such as your name, email address, and payment information.
        </li>
        <li>
          <strong>User Input (Prompts & Content):</strong> We collect the information, text, documents, and files you provide when using our Services ("Inputs"). This is necessary to provide you with the AI-generated responses.
        </li>
        <li>
          <strong>Usage Data:</strong> We automatically collect information about your interactions with our Services, including your IP address, browser type, device information, pages visited, and the dates and times of your visits.
        </li>
        <li>
          <strong>Cookies and Similar Technologies:</strong> We use cookies to operate and administer our Services, gather usage data, and improve your experience.
        </li>
      </ul>

      <h2 style={headingStyles}>2. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>To provide, maintain, and improve our Services, including training our models to be safer and more accurate.</li>
        <li>To process transactions and manage your account.</li>
        <li>To communicate with you, including sending service-related announcements and responding to your inquiries.</li>
        <li>To enforce our terms, prevent fraud, and ensure the security and integrity of our Services.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>
        We may use your Inputs to improve our Services. You can opt-out of having your data used for training purposes in your account settings.
      </p>

      <h2 style={headingStyles}>3. Information Sharing and Disclosure</h2>
      <p>We do not sell your personal information. We may share your information with:</p>
      <ul>
        <li><strong>Service Providers:</strong> Third-party vendors who provide services on our behalf, such as cloud hosting, payment processing, and analytics.</li>
        <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal process, or if we have a good faith belief that disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
      </ul>

      <h2 style="headingStyles">4. Data Security</h2>
      <p>
        We implement robust technical and organizational measures to protect your information. To learn more, please visit our <a href="/security">Security Page</a>.
      </p>

      <h2 style="headingStyles">5. Your Rights and Choices</h2>
      <p>
        You have rights over your personal information, including the right to access, correct, or delete your data. You can manage your information through your account settings or by contacting us directly.
      </p>

      <h2 style="headingStyles">6. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at: <strong>privacy@aetherprotech.com</strong>.</p>
    </div>
  );
};

export default PrivacyPage;