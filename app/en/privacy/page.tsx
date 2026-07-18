import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Privacy Policy</h1>
        <p><strong>Last updated:</strong> June 2026</p>

        <p>At <strong>IdeeaTa.ai</strong>, your privacy and data security are our top priorities. This Privacy Policy explains how we collect, use, protect, and, where applicable, share your personal data in accordance with the General Data Protection Regulation (GDPR).</p>

        <h2>1. What Data Do We Collect?</h2>
        <p>When you use IdeeaTa.ai, we may collect the following categories of data:</p>
        <ul>
          <li><strong>Authentication and Profile Data:</strong> Name, email address, profile picture (when you log in via Google or Facebook using Firebase Auth).</li>
          <li><strong>User Generated Content:</strong> Business ideas entered, business plans generated, budget options, and shared links. These are safely stored in our Firestore database to allow you to access them from your dashboard.</li>
          <li><strong>Transaction Data:</strong> If you upgrade to premium features, we do not directly collect or store your card details. All payment processing is performed securely by <strong>Lemon Squeezy</strong>. We only receive payment confirmation and a transaction ID.</li>
          <li><strong>Technical and Usage Data:</strong> IP address, browser type, device used, and basic analytics data collected to optimize the platform and prevent abuse (e.g., rate limiting).</li>
        </ul>

        <h2>2. How Do We Use Collected Data?</h2>
        <ul>
          <li><strong>To provide the service:</strong> Processing your idea through AI APIs (Google Gemini) to return your business plan.</li>
          <li><strong>To save history:</strong> Storing plans in Firebase so you can access and edit them later.</li>
          <li><strong>To process payments:</strong> Validating access to the "Interactive AI Studio" following payment through Lemon Squeezy.</li>
          <li><strong>For support and security:</strong> Preventing fraud, investigating errors (bug tracking), and providing technical support if you contact us.</li>
          <li><strong>Communication:</strong> Sending you transactional emails (receipts, password resets) and, occasionally, onboarding emails from which you can unsubscribe at any time.</li>
        </ul>

        <h2>3. Data Sharing with Third Parties</h2>
        <p>We do not sell your personal data. Data is shared exclusively with service processors (sub-processors) strictly necessary for platform operation:</p>
        <ul>
          <li><strong>Google (Firebase / Firestore):</strong> For database hosting, authentication, and plan storage.</li>
          <li><strong>Google (Gemini AI):</strong> To generate the text. Note that we only send the text fragments (prompts) entered by you. We do not send your personal identification data to the AI model.</li>
          <li><strong>Lemon Squeezy:</strong> To safely process your payments.</li>
          <li><strong>Google AdSense:</strong> If advertisements are displayed, advertising providers may use their own technologies for personalized ads (see Cookies Policy).</li>
        </ul>

        <h2>4. Your Rights (GDPR)</h2>
        <p>If you are a resident of the European Economic Area (EEA), you have the following rights:</p>
        <ol>
          <li><strong>Right of Access:</strong> You can request a copy of the data we hold.</li>
          <li><strong>Right to Erasure ("Right to be forgotten"):</strong> You can request the permanent deletion of your account and all plans from our database by sending an email to the address below. Data will be deleted within 30 days.</li>
          <li><strong>Right to Rectification:</strong> You can ask us to correct incorrect data.</li>
          <li><strong>Right to Withdraw Consent:</strong> You can revoke your agreement for cookies or marketing communications at any time.</li>
        </ol>

        <h2>5. Data Security</h2>
        <ul>
          <li><strong>Encryption:</strong> Data transmitted between your browser and our servers, as well as the Firestore database, are encrypted in transit and at rest.</li>
          <li><strong>Shared Links:</strong> If you use the "Share" feature of a business plan, the generated URL will be public to anyone who has the link, so please treat it responsibly.</li>
        </ul>

        <h2>6. Contact</h2>
        <p>To exercise your GDPR rights or for other privacy questions, you can contact us at: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/en/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validate your idea right now
          </Link>
        </div>
      </div>
    </div>
  );
}
