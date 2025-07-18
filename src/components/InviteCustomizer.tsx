import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { QRCodeCanvas } from 'qrcode.react';

interface InviteTemplate {
  id: number;
  name: string;
  img: string;
}

interface InviteCustomizerProps {
  template: InviteTemplate;
  onBack: () => void;
}

function generateInviteId() {
  return Math.random().toString(36).substring(2, 10);
}

const templateTexts = [
  {
    category: 'Wedding',
    name: 'Elegant Floral Wedding Invite',
    theme: 'floral',
    header: '💍 Together with their families',
    names: 'Aisha Sharma & Raj Verma',
    body: 'Request the honor of your presence as they celebrate their union in marriage.',
    details: '📍 The Grand Orchid Banquet Hall\n📅 Saturday, 10th December 2025\n⏰ 5:00 PM onwards',
    rsvp: 'Please confirm your presence by 1st December.\n📞 +91-9876543210',
  },
  {
    category: 'Wedding',
    name: 'Modern Minimalist Wedding Invite',
    theme: 'minimal',
    header: '💫 We said Yes!',
    names: 'Nisha & Akash',
    body: 'Join us as we begin our forever.',
    details: 'Venue: Sunset Lawn, Palm Resorts\nDate: 15th January 2026\nTime: 4:30 PM Ceremony, followed by Dinner',
    rsvp: 'Email: weddings@weenyou.com',
  },
  {
    category: 'Wedding',
    name: 'Watercolor Gold Wedding Invite',
    theme: 'watercolor-gold',
    header: 'Bismillahirrahmanirrahim\nYOU\'RE INVITED TO OUR WEDDING :',
    names: 'cahaya & abraham',
    body: 'SAVE THE DATE',
    details: 'SATURDAY   |   23   |   AT 5 PM\nAUGUST 2023\n123 ANYWHERE ST.,\nANY CITY, ST 12345',
    rsvp: '',
  },
  {
    category: 'Wedding',
    name: 'Floral Script Wedding',
    theme: 'floral-script-wedding',
    header: "YOU'RE INVITED TO THE WEDDING OF",
    names: 'Jennifer Janet\nand\nFrederick Wilson',
    body: '',
    details: '21 SEPTEMBER 2025\n18:00 - 21:00\n123 ANYWHERE ST., ANY CITY',
    rsvp: '',
  },
  // ... (add all 12 templates as objects here, following the pattern above) ...
];

const themeStyles: Record<string, any> = {
  floral: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    font: 'font-serif',
    accent: 'text-pink-700',
  },
  minimal: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    font: 'font-sans',
    accent: 'text-gray-800',
  },
  confetti: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    font: 'font-sans',
    accent: 'text-yellow-700',
  },
  neon: {
    bg: 'bg-black',
    border: 'border-purple-500',
    font: 'font-mono',
    accent: 'text-green-400',
  },
  gold: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    font: 'font-serif',
    accent: 'text-yellow-700',
  },
  collage: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    font: 'font-serif',
    accent: 'text-blue-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    font: 'font-sans',
    accent: 'text-blue-800',
  },
  tech: {
    bg: 'bg-gray-900',
    border: 'border-blue-400',
    font: 'font-mono',
    accent: 'text-blue-400',
  },
  woodland: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    font: 'font-serif',
    accent: 'text-green-700',
  },
  pink: {
    bg: 'bg-pink-100',
    border: 'border-pink-300',
    font: 'font-serif',
    accent: 'text-pink-700',
  },
  rustic: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    font: 'font-serif',
    accent: 'text-amber-700',
  },
  monogram: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    font: 'font-serif',
    accent: 'text-purple-700',
  },
  'watercolor-gold': {
    bg: 'bg-white',
    border: 'border-gray-200',
    font: 'font-serif',
    accent: 'text-yellow-700',
    custom: true,
  },
  'floral-script-wedding': {
    bg: 'bg-white',
    border: 'border-gray-200',
    font: 'font-serif',
    accent: 'text-yellow-700',
    custom: true,
  },
};

export default function InviteCustomizer({ template, onBack }: InviteCustomizerProps) {
  const [header, setHeader] = useState('');
  const [names, setNames] = useState('');
  const [body, setBody] = useState('');
  const [details, setDetails] = useState('');
  const [rsvp, setRSVP] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [inviteId] = useState(() => generateInviteId());
  const [guestList, setGuestList] = useState<{ email: string; name?: string }[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  // Compute RSVP link and WhatsApp URL for sharing
  const currentEmail = email || (guestList.length > 0 ? guestList[0].email : '');
  const rsvpLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/rsvp/${inviteId}?email=${encodeURIComponent(currentEmail)}`;
  const whatsappMessage = `You're invited! Please RSVP here: ${rsvpLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadImage = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current);
      const link = document.createElement('a');
      link.download = 'invite.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Fit image to page width
      const imgProps = canvas;
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      pdf.save('invite.pdf');
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const valid = data.filter(row => row.email && row.email.includes('@'));
        if (valid.length === 0) {
          setCsvError('No valid emails found in CSV.');
          setGuestList([]);
        } else {
          setGuestList(valid.map(row => ({ email: row.email, name: row.name })));
        }
      },
      error: () => setCsvError('Failed to parse CSV.'),
    });
  };

  const handleSendBulkEmails = async () => {
    setSending(true);
    setSendResult(null);
    let successCount = 0;
    let failCount = 0;
    for (const guest of guestList) {
      const inviteId = generateInviteId();
      const rsvpLink = `${window.location.origin}/rsvp/${inviteId}?email=${encodeURIComponent(guest.email)}`;
      const html = `
        <div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e7ef; border-radius: 12px; padding: 24px;\">
          <img src='${template.img}' alt='Invite Banner' style='width:100%; border-radius:8px; margin-bottom:16px;' />
          ${logo ? `<img src='${logo}' alt='Logo' style='width:64px; height:64px; border-radius:50%; border:2px solid #2563eb; margin-bottom:12px;' />` : ''}
          <h2 style='color:#2563eb; margin-bottom:8px;'>${header}</h2>
          <div style='color:#22313f; margin-bottom:4px;'><b>Names:</b> {names}</div>
          <div style='color:#22313f; margin-bottom:4px;'><b>Date:</b> {details ? new Date(details).toLocaleDateString() : 'Date'}</div>
          <div style='color:#22313f; margin-bottom:12px;'><b>Venue:</b> {rsvp ? rsvp.split('\n')[1] : 'Venue'}</div>
          <div style='color:#444; margin-bottom:16px;'>{body}</div>
          <a href='${rsvpLink}' style='display:inline-block; background:#2563eb; color:#fff; padding:10px 24px; border-radius:6px; text-decoration:none; font-weight:bold;'>RSVP</a>
        </div>
      `;
      try {
        const res = await fetch('/api/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: guest.email,
            subject: `You're Invited: ${header}`,
            html,
          }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }
    setSendResult(`Invites sent: ${successCount}, failed: ${failCount}`);
    setSending(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendResult(null);
    const currentEmail = email || (guestList.length > 0 ? guestList[0].email : '');
    const rsvpLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/rsvp/${inviteId}?email=${encodeURIComponent(currentEmail)}`;
    const whatsappMessage = `You're invited! Please RSVP here: ${rsvpLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e7ef; border-radius: 12px; padding: 24px;">
        <img src='${template.img}' alt='Invite Banner' style='width:100%; border-radius:8px; margin-bottom:16px;' />
        ${logo ? `<img src='${logo}' alt='Logo' style='width:64px; height:64px; border-radius:50%; border:2px solid #2563eb; margin-bottom:12px;' />` : ''}
        <h2 style='color:#2563eb; margin-bottom:8px;'>${header}</h2>
        <div style='color:#22313f; margin-bottom:4px;'><b>Names:</b> {names}</div>
        <div style='color:#22313f; margin-bottom:4px;'><b>Date:</b> {details ? new Date(details).toLocaleDateString() : 'Date'}</div>
        <div style='color:#22313f; margin-bottom:12px;'><b>Venue:</b> {rsvp ? rsvp.split('\n')[1] : 'Venue'}</div>
        <div style='color:#444; margin-bottom:16px;'>{body}</div>
        <a href='${rsvpLink}' style='display:inline-block; background:#2563eb; color:#fff; padding:10px 24px; border-radius:6px; text-decoration:none; font-weight:bold;'>RSVP</a>
      </div>
    `;
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `You're Invited: ${header}`,
          html,
        }),
      });
      if (res.ok) {
        setSendResult('Invite sent successfully!');
        setEmail('');
      } else {
        const data = await res.json();
        setSendResult(data.error || 'Failed to send invite.');
      }
    } catch (err) {
      setSendResult('Failed to send invite.');
    } finally {
      setSending(false);
    }
  };

  const applyTemplateText = (tpl: typeof templateTexts[0]) => {
    setHeader(tpl.header);
    setNames(tpl.names);
    setBody(tpl.body);
    setDetails(tpl.details);
    setRSVP(tpl.rsvp);
    setSelectedTheme(tpl.theme);
    setShowTemplatePicker(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Customization Form */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow border border-blue-100">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Back to Templates</button>
        <h2 className="text-2xl font-bold mb-4">Customize: {template.name}</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Header</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g. Together with their families" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Names</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={names} onChange={e => setNames(e.target.value)} placeholder="e.g. Aisha Sharma & Raj Verma" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Body</label>
            <textarea className="w-full border rounded px-3 py-2" value={body} onChange={e => setBody(e.target.value)} placeholder="e.g. Request the honor of your presence..." />
          </div>
          <div>
            <label className="block font-semibold mb-1">Details</label>
            <textarea className="w-full border rounded px-3 py-2" value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g. Venue, Date, Time" />
          </div>
          <div>
            <label className="block font-semibold mb-1">RSVP</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={rsvp} onChange={e => setRSVP(e.target.value)} placeholder="e.g. RSVP contact info" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Upload Logo or Photo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={handleDownloadImage} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition">Download as Image</button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition">Download as PDF</button>
        </div>
        <form onSubmit={handleSendEmail} className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <label className="block font-semibold mb-1">Send via Email</label>
          <input type="email" className="w-full border rounded px-3 py-2 mb-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="Recipient's email address" required />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition" disabled={sending}>{sending ? 'Sending...' : 'Send Invite'}</button>
          {sendResult && <div className={`mt-2 ${sendResult.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{sendResult}</div>}
        </form>
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <label className="block font-semibold mb-1">Upload Guest List (CSV)</label>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
          {csvError && <div className="text-red-600 mt-2">{csvError}</div>}
          {guestList.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Preview ({guestList.length} guests):</div>
              <ul className="max-h-32 overflow-y-auto text-sm bg-white border rounded p-2">
                {guestList.map((g, i) => (
                  <li key={i}>{g.name ? `${g.name} <${g.email}>` : g.email}</li>
                ))}
              </ul>
              <button type="button" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition" onClick={handleSendBulkEmails} disabled={sending}>{sending ? 'Sending...' : 'Send Invites to All'}</button>
            </div>
          )}
        </div>
        <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-lg flex flex-col items-center">
          <div className="mb-2 font-semibold">Share via WhatsApp</div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold transition mb-2">Share Invite on WhatsApp</a>
          <div className="mt-4 flex flex-col items-center">
            <div className="mb-1 font-semibold">Or scan QR code to RSVP:</div>
            <QRCodeCanvas value={rsvpLink} size={128} />
          </div>
        </div>
        <button type="button" className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold transition" onClick={() => setShowTemplatePicker(true)}>Choose Pre-written Text</button>
      </div>
      {/* Live Preview */}
      <div className="flex-1 bg-blue-50 p-6 rounded-lg shadow border border-blue-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
        {selectedTheme === 'floral-script-wedding' ? (
          <>
            <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
            <div
              ref={previewRef}
              style={{
                background: `url(/templates/floral-script-bg.png) center/cover, #fff`,
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: 32,
                textAlign: 'center',
                maxWidth: 400,
                margin: 'auto',
                border: '1px solid #eee',
                position: 'relative',
                minHeight: 600,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              className="flex flex-col items-center"
            >
              <div style={{ color: '#222', marginBottom: 16, fontSize: 15, fontWeight: 500, letterSpacing: 1 }}>{header}</div>
              <div
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: 38,
                  color: '#222',
                  margin: '16px 0 0 0',
                  fontWeight: 400,
                  letterSpacing: 1,
                  whiteSpace: 'pre-line',
                }}
              >
                {names}
              </div>
              <div style={{ color: '#222', margin: '24px 0 0 0', fontSize: 15, fontWeight: 500, letterSpacing: 1, whiteSpace: 'pre-line' }}>{details}</div>
            </div>
          </>
        ) : (
          <div ref={previewRef} className={`w-full max-w-xs border rounded-lg p-4 flex flex-col items-center relative ${themeStyles[selectedTheme]?.bg || 'bg-white'} ${themeStyles[selectedTheme]?.border || 'border-blue-200'}`}>
            <div className="text-lg font-bold mb-2 text-center">{header}</div>
            <div className="text-2xl font-extrabold mb-2 text-center tracking-wide">{names}</div>
            <div className="italic text-center mb-2">{body}</div>
            <div className="text-center mb-2 whitespace-pre-line">{details}</div>
            <div className="mt-2 text-center font-semibold text-blue-700 whitespace-pre-line">{rsvp}</div>
            {logo && <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-full border-2 border-blue-300 mb-2 absolute top-2 right-2 bg-white" />}
          </div>
        )}
      </div>
      {showTemplatePicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">Select an E-Invite Template</h2>
            <ul className="space-y-4">
              {templateTexts.map((tpl, i) => (
                <li key={i} className={`border rounded p-3 hover:bg-blue-50 cursor-pointer ${themeStyles[tpl.theme]?.bg} ${themeStyles[tpl.theme]?.border}`} onClick={() => applyTemplateText(tpl)}>
                  <div className={`font-semibold ${themeStyles[tpl.theme]?.accent}`}>{tpl.category} - {tpl.name}</div>
                  <div className={`text-sm mt-1 whitespace-pre-line ${themeStyles[tpl.theme]?.font}`}>{tpl.header}\n{tpl.names}\n{tpl.body}\n{tpl.details}\n{tpl.rsvp}</div>
                </li>
              ))}
            </ul>
            <button className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold transition" onClick={() => setShowTemplatePicker(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 