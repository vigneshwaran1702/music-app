import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// Web-only file to configure the root HTML document
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>Aura Music</title>
        <meta name="description" content="Aura Music - Stream and discover millions of high-fidelity songs, playlists, and artists." />
        <meta name="theme-color" content="#0d0e15" />

        {/* Favicon and Apple Touch Icons */}
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Disable body scrolling on web for app-like behavior */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
              outline: none !important;
              -webkit-tap-highlight-color: transparent;
            }
            *:focus, *:focus-visible {
              outline: none !important;
              box-shadow: none !important;
            }
            input, textarea, button, select, [role="button"], [tabindex] {
              outline: none !important;
              box-shadow: none !important;
              border: none !important;
              border-width: 0 !important;
            }
            input:focus, textarea:focus, button:focus, [role="button"]:focus {
              outline: none !important;
              box-shadow: none !important;
              border: none !important;
              border-width: 0 !important;
            }
            input[type="text"], input[type="search"], input {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              background-color: transparent !important;
            }
            body {
              background-color: #000000;
              color: #ffffff;
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
