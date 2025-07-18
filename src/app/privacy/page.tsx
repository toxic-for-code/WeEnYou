import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-2">
      <div className="bg-white max-w-4xl w-full rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 mb-2">🛡️ WeEnYou Privacy Policy</h1>
        <div className="text-sm text-gray-500 font-medium text-right mb-6">Last Updated: <span className="font-semibold">13 July 2025</span></div>
        <p className="text-gray-700 text-base mb-6">WeEnYou is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, how we protect it, and your rights regarding your personal information. It also provides details on how to contact us if you have any questions or concerns.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🏢 Information About WeEnYou</h2>
        <p className="mb-6 text-gray-700">In this Privacy Policy, references to <b>“WeEnYou”</b>, <b>“we”</b>, <b>“us”</b>, or <b>“our”</b> refer to <b>WeEnYou</b>, an independently operated platform created and managed by its founding team. WeEnYou is not part of any parent company or corporate group.<br /><br />WeEnYou is a digital platform that allows users to discover, compare, and book venues and event-related services — such as decorators, caterers, photographers, and entertainers — across India. We aim to simplify event planning through curated listings, smart filters, and seamless booking and payment experiences.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🌐 Scope of Our Privacy Policy</h2>
        <p className="mb-6 text-gray-700">This policy applies to anyone who interacts with us in relation to our services ("you", "your") via any communication channel, including:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
          <li>Our website and mobile platform</li>
          <li>Email or phone calls</li>
          <li>Social media channels</li>
          <li>Walk-ins or in-person support</li>
        </ul>
        <p className="mb-6 text-gray-700">We may also provide additional privacy notices for specific interactions where required by law.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">🔍 1. Information We Collect</h2>
        <h3 className="font-semibold text-gray-800 mt-4 mb-1">a. Personal Information</h3>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Full name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Profile photo (optional)</li>
          <li>Event preferences and booking history</li>
        </ul>
        <h3 className="font-semibold text-gray-800 mt-4 mb-1">b. Payment Information</h3>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Handled securely through trusted payment gateways like <b>Razorpay</b></li>
          <li className="text-red-600 font-semibold">We do not store card, UPI, or wallet details on our servers</li>
        </ul>
        <h3 className="font-semibold text-gray-800 mt-4 mb-1">c. Technical & Usage Data</h3>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>IP address, device type, browser version</li>
          <li>Cookies and usage tracking</li>
          <li>Location data (with permission)</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">⚙️ 2. How We Use Your Information</h2>
        <p className="mb-2 text-gray-700">We use your information to:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>Process and confirm bookings</li>
          <li>Match your preferences with suitable venues and services</li>
          <li>Send booking confirmations, reminders, and support messages</li>
          <li>Improve our platform experience and personalization</li>
          <li>Run marketing campaigns (with opt-out options)</li>
          <li>Conduct analytics for service optimization</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">🔐 3. How We Store and Protect Your Data</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>All user data is stored on <b>secure, encrypted servers</b></li>
          <li>We use <b>SSL encryption</b>, firewalls, and strict access controls</li>
          <li>Access is limited to trained and authorized team members only</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">🔄 4. Sharing of Information</h2>
        <p className="mb-2 text-gray-700">We do <b>not sell</b> your data. We may share your information:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>With vendors/venues you book or inquire about</li>
          <li>With payment processors (for transaction completion only)</li>
          <li>With legal or regulatory authorities when required by law</li>
        </ul>
        <p className="mb-6 text-gray-700">Your personal data is never shared for third-party advertising or unrelated marketing.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">🍪 5. Cookies Policy</h2>
        <p className="mb-2 text-gray-700">We use cookies to:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Keep you logged in</li>
          <li>Store your preferences (e.g. selected city or category)</li>
          <li>Track usage behavior to improve our service</li>
        </ul>
        <p className="mb-6 text-gray-700">You can manage or disable cookies in your browser. Please note that some features may not function properly if cookies are disabled.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">🧾 6. Your Rights</h2>
        <p className="mb-2 text-gray-700">You have the right to:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Access and update your personal information</li>
          <li>Request deletion of your account and data</li>
          <li>Opt out of promotional communications</li>
        </ul>
        <p className="mb-6 text-gray-700">To exercise these rights, simply contact us at:<br />📧 <b><a href="mailto:support@weenyou.com" className="text-blue-600 underline">support@weenyou.com</a></b></p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">📞 7. Contact Us</h2>
        <p className="mb-2 text-gray-700">If you have questions about this Privacy Policy or your personal data, reach out to us:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>📧 <b>Email:</b> <a href="mailto:support@weenyou.com" className="text-blue-600 underline">support@weenyou.com</a></li>
          <li>📞 <b>Phone:</b> +91-XXXXXXXXXX</li>
        </ul>
      </div>
    </div>
  );
} 