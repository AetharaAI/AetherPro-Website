// src/pages/CareersPage.tsx

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

const jobCardStyles: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const jobTitleStyles: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  color: '#0056b3',
};

const applyButtonStyles: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '1rem',
  padding: '0.5rem 1.5rem',
  backgroundColor: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
};

// In a real app, this data would likely come from an API
const jobOpenings = [
  {
    title: 'Senior AI Research Scientist',
    location: 'Remote / San Francisco, CA',
    description: 'Lead research in large language models and multi-agent systems. PhD in a relevant field required.',
  },
  {
    title: 'Backend Systems Engineer (AI Infrastructure)',
    location: 'Remote',
    description: 'Build and scale the distributed systems that power the AetherPro OS. Experience with Python, Go, and Kubernetes is a plus.',
  },
  {
    title: 'Senior Frontend Engineer (React/TypeScript)',
    location: 'Remote',
    description: 'Design and build intuitive user interfaces and developer consoles for our complex AI ecosystem.',
  },
];

const CareersPage: React.FC = () => {
  return (
    <div style={pageStyles}>
      <h1 style={headingStyles}>Careers at AetherPro</h1>
      <p>
        We are building the next generation of collaborative artificial intelligence. Our mission is to transform isolated AI tools into a unified, intelligent ecosystem. If you are passionate about solving complex problems at the forefront of technology, we want to hear from you.
      </p>

      <h2 style={headingStyles}>Why Join Us?</h2>
      <ul>
        <li><strong>Impact:</strong> Work on foundational AI technology that will empower developers and businesses worldwide.</li>
        <li><strong>Innovation:</strong> Tackle unsolved challenges in a fast-paced, research-driven environment.</li>
        <li><strong>Culture:</strong> Join a collaborative, curious, and dedicated team of experts.</li>
        <li><strong>Benefits:</strong> We offer competitive salaries, comprehensive health benefits, and flexible work arrangements.</li>
      </ul>

      <h2 style={headingStyles}>Open Positions</h2>
      {jobOpenings.length > 0 ? (
        jobOpenings.map((job, index) => (
          <div key={index} style={jobCardStyles}>
            <h3 style={jobTitleStyles}>{job.title}</h3>
            <p><strong>Location:</strong> {job.location}</p>
            <p>{job.description}</p>
            <a href="mailto:careers@aetherprotech.com?subject=Application for {job.title}" style={applyButtonStyles}>
              Apply Now
            </a>
          </div>
        ))
      ) : (
        <p>There are no open positions at this time. Please check back later.</p>
      )}

      <p>
        AetherPro is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
      </p>
    </div>
  );
};

export default CareersPage;