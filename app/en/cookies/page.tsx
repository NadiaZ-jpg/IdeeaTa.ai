import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <Link href="/en/demo" className="text-zinc-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mb-8 inline-flex no-underline">
          <span>←</span>
          <span>Back to application</span>
        </Link>
        <h1>Cookies Policy</h1>
        <p><strong>Last updated:</strong> June 2026</p>

        <p>To ensure the proper functioning of the <strong>IdeeaTa.ai</strong> platform and to offer you an optimal user experience, we use cookies and similar technologies. By accessing the site, you agree to the use of cookies in accordance with this policy.</p>

        <h2>1. What are cookies?</h2>
        <p>Cookies are small text files, stored by your browser on the device you navigate from, which help the website remember your actions and preferences (such as logging into your account or language settings) over a period of time.</p>

        <h2>2. Types of Cookies we use</h2>
        
        <h3>A. Strictly Necessary Cookies (Required)</h3>
        <p>These cookies are essential for the IdeeaTa.ai application to function correctly. They cannot be turned off.</p>
        <ul>
          <li><strong>Authentication (Firebase):</strong> Keep your session active after you log in with Google or Facebook. Without them, you would have to log in again with every click.</li>
          <li><strong>Payment Processing (Lemon Squeezy):</strong> Lemon Squeezy uses cookies and local storage to detect fraud and ensure the security of transaction data during payment.</li>
          <li><strong>Temporary Plan Saving (Local Storage):</strong> We temporarily save the plan you write in the browser memory (Local Storage) so that if you accidentally close the window, you do not lose your work.</li>
        </ul>

        <h3>B. Analytical and Performance Cookies</h3>
        <p>These help us understand how users interact with our application (for example, which are the most used types of charts or where users get stuck) so we can improve the interface.</p>
        <ul>
          <li>The data collected is typically anonymized.</li>
        </ul>

        <h3>C. Advertising and Targeting Cookies (Google AdSense)</h3>
        <p>Since we use Google AdSense to partially support the development of the platform:</p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this site or other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li>
          <li>You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400">Google Ad Settings</a>.</li>
        </ul>

        <h2>3. How Can You Manage Cookies?</h2>
        <ul>
          <li><strong>From your browser:</strong> Most browsers allow you to view, delete, or block cookies for all sites or just specific sites. Please note that blocking Strictly Necessary cookies will make it impossible to log into your IdeeaTa.ai account.</li>
          <li><strong>AdSense Opt-out:</strong> In addition to the link mentioned above, you can use sites like www.aboutads.info to opt out of certain tracking cookies used by various vendors.</li>
        </ul>

        <h2>4. Changes</h2>
        <p>We will periodically update this Cookies Policy. Any changes will be effective immediately upon posting the revised version on the site.</p>

        <p><em>If you have any further questions, contact us at: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</em></p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/en/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validate your idea right now
          </Link>
        </div>
      </div>
    </div>
  );
}
