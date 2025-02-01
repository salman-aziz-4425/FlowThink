import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="hero-section">
          <img style={{borderRadius: '20%'}} src="/flowthink.webp" alt="Flow Think Logo" className="logo" />
          <h1>Flow Think</h1>
          <p className="tagline">Transform YouTube Videos into Interactive Conversations</p>
          <button className="cta-button" onClick={() => navigate('/workspace')}>
            Get Started
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Visual Node System</h3>
            <p>Create and connect nodes through an intuitive drag-and-drop interface</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔗</span>
            <h3>Smart Connections</h3>
            <p>Link YouTube videos to chat interfaces seamlessly</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>Interactive Chat</h3>
            <p>Ask questions and get intelligent responses about video content</p>
          </div>
        </div>

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>Create a URL node with your YouTube video</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p>Add a Chat node to interact with the video</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p>Connect nodes and start asking questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 