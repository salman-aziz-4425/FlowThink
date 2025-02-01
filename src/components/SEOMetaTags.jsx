import React from 'react';
import { Helmet } from 'react-helmet';

const SEOMetaTags = () => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Flow Think - Visual Node-Based Chat Interface</title>
      <meta name="title" content="Flow Think - Visual Node-Based Chat Interface" />
      <meta name="description" content="Interactive visual interface for connecting YouTube videos to chat nodes. Create, connect, and interact with video content through an intuitive drag-and-drop interface." />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://flowthink.app/" />
      <meta property="og:title" content="Flow Think - Visual Node-Based Chat Interface" />
      <meta property="og:description" content="Interactive visual interface for connecting YouTube videos to chat nodes. Create, connect, and interact with video content through an intuitive drag-and-drop interface." />
      <meta property="og:image" content="/flowthink-preview.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://flowthink.app/" />
      <meta property="twitter:title" content="Flow Think - Visual Node-Based Chat Interface" />
      <meta property="twitter:description" content="Interactive visual interface for connecting YouTube videos to chat nodes. Create, connect, and interact with video content through an intuitive drag-and-drop interface." />
      <meta property="twitter:image" content="/flowthink-preview.png" />

      {/* Additional SEO tags */}
      <meta name="keywords" content="flow think, node-based chat, youtube interaction, visual interface, drag and drop, react application, jsplumb, interactive chat" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Flow Think Team" />
      
      {/* PWA related tags */}
      <meta name="theme-color" content="#4CAF50" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://flowthink.app/" />
    </Helmet>
  );
};

export default SEOMetaTags; 