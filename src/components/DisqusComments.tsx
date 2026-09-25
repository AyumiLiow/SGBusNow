import React, { useEffect } from 'react';

// Configuration: Disqus shortname and live canonical URL
const DEFAULT_SHORTNAME = 'sgbusnow.disqus.com';
const DEFAULT_PAGE_URL = 'https://sgbusnow.vercel.app/';
const DEFAULT_PAGE_IDENTIFIER = 'home';

declare global {
  interface Window {
    disqus_config?: () => void;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: () => void }) => void;
    };
  }
}

interface DisqusCommentsProps {
  viewMode?: 'mobile' | 'full';
  shortname?: string;
  url?: string;
  identifier?: string;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  viewMode = 'mobile',
  shortname = DEFAULT_SHORTNAME,
  url = DEFAULT_PAGE_URL,
  identifier = DEFAULT_PAGE_IDENTIFIER,
}) => {
  useEffect(() => {
    // Ensure clean HTTPS URL without query string
    const cleanUrl = url.split('?')[0];

    // Normalize shortname in case user passes "sgbusnow.disqus.com" or "sgbusnow"
    const normalizedShortname = shortname
      .replace(/^https?:\/\//i, '')
      .replace(/\.disqus\.com\/?$/i, '')
      .replace(/\/+$/, '')
      .trim();

    // Configure Disqus parameters defensively
    window.disqus_config = function (this: any) {
      const config = this || {};
      if (!config.page) {
        config.page = {};
      }
      config.page.url = cleanUrl;
      config.page.identifier = identifier;
    };

    // If script is already initialized on the page, safely reset Disqus
    if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            const config = this || {};
            if (!config.page) {
              config.page = {};
            }
            config.page.url = cleanUrl;
            config.page.identifier = identifier;
          },
        });
      } catch (err) {
        // Suppress transient reset errors when Disqus is initializing
      }
      return;
    }

    // Load the Disqus Universal Code script tag only once
    const scriptId = 'disqus-universal-code';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://${normalizedShortname}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', Date.now().toString());
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => {
        // Prevent uncaught error when network blocks or fails Disqus embed
      };
      (document.head || document.body).appendChild(script);
    }
  }, [shortname, url, identifier]);

  return (
    <section
      id="disqus-feedback-section"
      className={`w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mt-4 transition-all duration-300 ${
        viewMode === 'full' ? 'max-w-2xl' : 'max-w-[420px]'
      }`}
      aria-label="Visitor Feedback"
    >
      {/* Short line inviting visitor feedback */}
      <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-4 text-center">
        Tell us what worked for you and what did not!
      </p>

      {/* Disqus thread container */}
      <div id="disqus_thread" className="min-h-[140px]" />
    </section>
  );
};
