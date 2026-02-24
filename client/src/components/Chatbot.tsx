import { useEffect } from 'react';

export function Chatbot() {
  useEffect(() => {
    // Check if already loaded
    if (document.getElementById('botpress-script1')) return;

    // ✅ Script 1 load karo pehle
    const script1 = document.createElement('script');
    script1.id = 'botpress-script1';
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
    script1.async = true;

    // ✅ Script 1 load hone ke BAAD Script 2 lagao
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.id = 'botpress-script2';
      script2.src = 'https://files.bpcontent.cloud/2026/02/23/14/20260223143650-GQU1IAZI.js';
      script2.async = true;
      document.body.appendChild(script2);
    };

    document.body.appendChild(script1);
  }, []);

  return null;
}

export default Chatbot;