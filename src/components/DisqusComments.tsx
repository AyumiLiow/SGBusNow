import React, { useEffect } from 'react';

// Default Configuration: Disqus shortname and canonical URL
// (Matches live deployment https://sgbusnow.vercel.app)
const DEFAULT_SHORTNAME = 'sgbusnow';
const DEFAULT_PAGE_URL = 'https://sgbusnow.vercel.app';
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
    // 1. Configure Disqus page parameters
    window.disqus_config = function (this: any) {
      this.page.url = url;
      this.page.identifier = identifier;
    };

    // 2. If Disqus is already loaded, reset it without re-injecting the script tag
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page.url = url;
          this.page.identifier = identifier;
        },
      });
      return;
    }

    // 3. Load the Disqus Universal Code script tag only once
    const scriptId = 'disqus-universal-code';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://${shortname}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', Date.now().toString());
      script.async = true;
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
        Let us know what worked for you and what did not!
      </p>

      {/* Disqus thread container */}
      <div id="disqus_thread" className="min-h-[140px]" />
    </section>
  );
};
