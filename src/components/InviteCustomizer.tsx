'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  QrCodeIcon,
  ShareIcon,
  UserGroupIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ArrowPathIcon,
  MusicalNoteIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface InviteTemplate {
  id: number;
  name: string;
  img: string;
}

interface InviteCustomizerProps {
  template: InviteTemplate;
  onBack: () => void;
}

// Google Fonts dataset
const FONTS = [
  { name: 'Great Vibes (Script)', family: 'Great Vibes', category: 'wedding' },
  { name: 'Playfair Display (Elegant)', family: 'Playfair Display', category: 'classic' },
  { name: 'Cinzel (Royal Roman)', family: 'Cinzel', category: 'royal' },
  { name: 'Montserrat (Modern Sans)', family: 'Montserrat', category: 'minimal' },
  { name: 'Parisienne (Romantic Brush)', family: 'Parisienne', category: 'wedding' },
  { name: 'Alex Brush (Classic Script)', family: 'Alex Brush', category: 'wedding' },
  { name: 'Cormorant Garamond (Serif)', family: 'Cormorant Garamond', category: 'classic' },
  { name: 'Oswald (Bold Sans)', family: 'Oswald', category: 'minimal' }
];

// Luxury Pre-set Color Themes
const COLOR_THEMES = [
  { key: 'luxury-gold', name: 'Luxury Gold', primary: '#C89B3C', secondary: '#F5E6C4', text: '#3A2E16', bg: '#FAF8F5' },
  { key: 'rose-gold', name: 'Rose Gold', primary: '#E0A899', secondary: '#F5E1DD', text: '#4D3631', bg: '#FDFBFB' },
  { key: 'royal-blue', name: 'Royal Blue', primary: '#1B4F72', secondary: '#D4E6F1', text: '#152F3F', bg: '#F4F7F9' },
  { key: 'emerald-green', name: 'Emerald', primary: '#0E6251', secondary: '#D1F2EB', text: '#0A392F', bg: '#F2F9F7' },
  { key: 'minimal-white', name: 'Minimal White', primary: '#111827', secondary: '#E5E7EB', text: '#1F2937', bg: '#FCFCFC' },
  { key: 'classic-red', name: 'Classic Red', primary: '#900C3F', secondary: '#FADBD8', text: '#581845', bg: '#FDF7F7' },
  { key: 'pastel-pink', name: 'Pastel Pink', primary: '#E082B3', secondary: '#FADBD8', text: '#5D2E46', bg: '#FDF8F9' },
  { key: 'modern-black', name: 'Modern Black', primary: '#111111', secondary: '#333333', text: '#FFFFFF', bg: '#1A1A1A' }
];

const BACKGROUND_TEXTURES = [
  { key: 'none', name: 'Plain Clean' },
  { key: 'linen', name: 'Linen Fiber' },
  { key: 'vintage', name: 'Vintage Parchment' },
  { key: 'marble', name: 'Subtle Marble' }
];

const BORDER_STYLES = [
  { key: 'none', name: 'No Border' },
  { key: 'double', name: 'Double Line' },
  { key: 'floral', name: 'Floral Trim' },
  { key: 'lace', name: 'Vintage Lace' }
];

const DECORATIVE_ICONS = [
  { key: 'none', name: 'None', char: '' },
  { key: 'rings', name: 'Rings 💍', char: '💍' },
  { key: 'wreath', name: 'Wreath 👑', char: '👑' },
  { key: 'royal', name: 'Royal ⚜️', char: '⚜️' },
  { key: 'heart', name: 'Heart ❤️', char: '❤️' }
];

const AUDIO_TRACKS = [
  { key: 'none', name: 'No Background Music', url: '' },
  { key: 'flute', name: 'Traditional Flute', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { key: 'piano', name: 'Romantic Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { key: 'violin', name: 'Classic Violin', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

function generateInviteId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function InviteCustomizer({ template, onBack }: InviteCustomizerProps) {
  // Collapsible Accordion sections state
  const [activeSection, setActiveSection] = useState<string>('details');

  // Input States
  const [header, setHeader] = useState("YOU'RE INVITED");
  const [names, setNames] = useState("Couple Names");
  const [body, setBody] = useState("Join us in celebrating this special day.");
  const [details, setDetails] = useState("Date: 12th December 2026\nVenue: Indiranagar, Bengaluru");
  const [rsvp, setRSVP] = useState("RSVP details inside");
  const [dressCode, setDressCode] = useState("Semi-Formal / Pastel");
  
  // Theme & Styling States
  const [selectedThemeKey, setSelectedThemeKey] = useState('luxury-gold');
  const [selectedFontFamily, setSelectedFontFamily] = useState('Playfair Display');
  const [selectedTexture, setSelectedTexture] = useState('none');
  const [selectedBorder, setSelectedBorder] = useState('none');
  const [selectedIcon, setSelectedIcon] = useState('none');
  
  // Opacity & Blur values
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(100);

  // Photo uploads
  const [logo, setLogo] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState(100);
  const [photoRotate, setPhotoRotate] = useState(0);

  // Audio Music States
  const [selectedAudioKey, setSelectedAudioKey] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // QR Code States
  const [qrType, setQrType] = useState('none');
  const [qrValue, setQrValue] = useState('');

  // Save / Draft status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Bulk / Email Deliveries
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [guestList, setGuestList] = useState<{ email: string; name?: string }[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const [inviteId] = useState(() => generateInviteId());

  // Dynamically load selected Google Web Font
  useEffect(() => {
    if (selectedFontFamily) {
      const linkId = `google-font-${selectedFontFamily.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${selectedFontFamily.replace(/\s+/g, '+')}&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [selectedFontFamily]);

  // Audio play/pause hook
  useEffect(() => {
    const track = AUDIO_TRACKS.find(t => t.key === selectedAudioKey);
    if (!track || !track.url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(track.url);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = track.url;
    }

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.warn('Browser blocked autoplay music. Click play manually.', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedAudioKey, isPlaying]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`weenyou_draft_${template.id}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setHeader(parsed.header ?? "YOU'RE INVITED");
        setNames(parsed.names ?? "Couple Names");
        setBody(parsed.body ?? "Join us in celebrating this special day.");
        setDetails(parsed.details ?? "Date: 12th December 2026\nVenue: Indiranagar, Bengaluru");
        setRSVP(parsed.rsvp ?? "RSVP details inside");
        setDressCode(parsed.dressCode ?? "Semi-Formal / Pastel");
        setSelectedThemeKey(parsed.selectedThemeKey ?? 'luxury-gold');
        setSelectedFontFamily(parsed.selectedFontFamily ?? 'Playfair Display');
        setSelectedTexture(parsed.selectedTexture ?? 'none');
        setSelectedBorder(parsed.selectedBorder ?? 'none');
        setSelectedIcon(parsed.selectedIcon ?? 'none');
        setBgBlur(parsed.bgBlur ?? 0);
        setBgOpacity(parsed.bgOpacity ?? 100);
        setQrType(parsed.qrType ?? 'none');
        setQrValue(parsed.qrValue ?? '');
        setSelectedAudioKey(parsed.selectedAudioKey ?? 'none');
        if (parsed.logo) setLogo(parsed.logo);
      } catch (err) {
        console.error('Failed to parse draft invite:', err);
      }
    }
  }, [template.id]);

  // Auto-Save Trigger
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const draft = {
        header,
        names,
        body,
        details,
        rsvp,
        dressCode,
        selectedThemeKey,
        selectedFontFamily,
        selectedTexture,
        selectedBorder,
        selectedIcon,
        bgBlur,
        bgOpacity,
        qrType,
        qrValue,
        selectedAudioKey,
        logo
      };
      localStorage.setItem(`weenyou_draft_${template.id}`, JSON.stringify(draft));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    header, names, body, details, rsvp, dressCode,
    selectedThemeKey, selectedFontFamily, selectedTexture,
    selectedBorder, selectedIcon, bgBlur, bgOpacity, qrType,
    qrValue, selectedAudioKey, logo, template.id
  ]);

  const activeTheme = COLOR_THEMES.find(t => t.key === selectedThemeKey) || COLOR_THEMES[0];

  // Sharing coordinates
  const rsvpLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/rsvp/${inviteId}?email=${encodeURIComponent(email || 'guest@example.com')}`;
  const whatsappMessage = `You're invited! Please RSVP here: ${rsvpLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  // Logo / Couple Image Change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
        setPhotoZoom(100);
        setPhotoRotate(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Downloader
  const handleDownloadImage = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, { useCORS: true });
      const link = document.createElement('a');
      link.download = `${names.replace(/\s+/g, '_')}_invite.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // PDF Downloader
  const handleDownloadPDF = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, { useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      pdf.save(`${names.replace(/\s+/g, '_')}_invite.pdf`);
    }
  };

  // CSV parsing
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

  // Bulk Email Delivery
  const handleSendBulkEmails = async () => {
    setSending(true);
    setSendResult(null);
    let successCount = 0;
    let failCount = 0;
    
    for (const guest of guestList) {
      const currentInviteId = generateInviteId();
      const currentRsvpLink = `${window.location.origin}/rsvp/${currentInviteId}?email=${encodeURIComponent(guest.email)}`;
      const html = `
        <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2d1b0; border-radius: 24px; padding: 32px; background-color: ${activeTheme.bg}; text-align: center;">
          <h3 style="color: ${activeTheme.primary}; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">${header}</h3>
          <h2 style="color: ${activeTheme.text}; margin-bottom: 16px; font-size: 26px;">${names}</h2>
          <div style="color: ${activeTheme.text}; font-size: 15px; margin-bottom: 24px; white-space: pre-line;">${details}</div>
          <div style="color: #666; margin-bottom: 24px; font-style: italic;">${body}</div>
          <a href="${currentRsvpLink}" style="display: inline-block; background: ${activeTheme.primary}; color: #fff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: bold;">RSVP Invitation</a>
        </div>
      `;
      try {
        const res = await fetch('/api/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: guest.email,
            subject: `You're Invited: ${names}`,
            html,
          }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }
    setSendResult(`Broadcast sent successfully: ${successCount} emails, failed: ${failCount}`);
    setSending(false);
  };

  // Single Email Delivery
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setSendResult(null);
    
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2d1b0; border-radius: 24px; padding: 32px; background-color: ${activeTheme.bg}; text-align: center;">
        <h3 style="color: ${activeTheme.primary}; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">${header}</h3>
        <h2 style="color: ${activeTheme.text}; margin-bottom: 16px; font-size: 26px;">${names}</h2>
        <div style="color: ${activeTheme.text}; font-size: 15px; margin-bottom: 24px; white-space: pre-line;">${details}</div>
        <div style="color: #666; margin-bottom: 24px; font-style: italic;">${body}</div>
        <a href="${rsvpLink}" style="display: inline-block; background: ${activeTheme.primary}; color: #fff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: bold;">RSVP Invitation</a>
      </div>
    `;
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `You're Invited: ${names}`,
          html,
        }),
      });
      if (res.ok) {
        setSendResult('Invitation email delivered successfully!');
        setEmail('');
      } else {
        const data = await res.json();
        setSendResult(data.error || 'Could not deliver email invitation.');
      }
    } catch {
      setSendResult('Could not deliver email invitation.');
    } finally {
      setSending(false);
    }
  };

  // CSS textures mappings
  const getTextureStyle = () => {
    switch (selectedTexture) {
      case 'linen':
        return {
          backgroundImage: `repeating-linear-gradient(to right, rgba(0,0,0,0.012) 0px, rgba(0,0,0,0.012) 1px, transparent 1px, transparent 4px),
                            repeating-linear-gradient(to bottom, rgba(0,0,0,0.012) 0px, rgba(0,0,0,0.012) 1px, transparent 1px, transparent 4px)`
        };
      case 'vintage':
        return {
          background: `radial-gradient(circle, rgba(253,245,230,0.4) 0%, rgba(240,225,195,0.7) 100%)`,
          filter: `sepia(0.1)`
        };
      case 'marble':
        return {
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.01) 100%)`,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02)'
        };
      default:
        return {};
    }
  };

  // Border styles mapping
  const getBorderStyle = () => {
    switch (selectedBorder) {
      case 'double':
        return {
          border: `6px double ${activeTheme.primary}`,
          padding: '24px'
        };
      case 'floral':
        return {
          border: `4px dashed ${activeTheme.primary}80`,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: `inset 0 0 0 8px ${activeTheme.primary}15`
        };
      case 'lace':
        return {
          border: `3px solid ${activeTheme.primary}40`,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: `inset 0 0 0 12px ${activeTheme.primary}08`
        };
      default:
        return {
          border: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '32px'
        };
    }
  };

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? '' : section);
  };

  // Scroll to preview on mobile
  const scrollToPreview = () => {
    const previewEl = document.getElementById('live-preview-viewport');
    previewEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch min-h-[85vh] relative">
      
      {/* Design Panel: order-2 on mobile (below preview), order-1 on desktop */}
      <div className="w-full lg:w-[40%] flex flex-col bg-white border border-gray-150 rounded-[28px] shadow-sm overflow-hidden h-fit order-2 lg:order-1">
        
        {/* Panel Header */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Back to templates"
            >
              <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="text-left">
              <h2 className="font-bold text-gray-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">Design Panel</h2>
              <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">{template.name}</p>
            </div>
          </div>
          
          {/* Saved Status indicator */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-amber-500 animate-spin'}`} />
            <span className="text-xs font-bold text-gray-500">
              {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
            </span>
          </div>
        </div>

        {/* Accordion List container */}
        <div className="divide-y divide-gray-100 overflow-y-auto max-h-[70vh]">
          
          {/* Section 1: Event Details */}
          <div className="w-full">
            <button
              onClick={() => toggleSection('details')}
              className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/30 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                Event Details
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${activeSection === 'details' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeSection === 'details' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50/20 border-t border-gray-100 space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Header</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                        value={header} 
                        onChange={e => setHeader(e.target.value)} 
                        placeholder="e.g. TOGETHER WITH THEIR FAMILIES" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Names / Couple Names</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                        value={names} 
                        onChange={e => setNames(e.target.value)} 
                        placeholder="e.g. Aisha & Raj" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Invitation Body</label>
                      <textarea 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none resize-none"
                        rows={3}
                        value={body} 
                        onChange={e => setBody(e.target.value)} 
                        placeholder="e.g. Request the honor of your presence..." 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Event Info (Venue & Date)</label>
                      <textarea 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none resize-none"
                        rows={3}
                        value={details} 
                        onChange={e => setDetails(e.target.value)} 
                        placeholder="e.g. Date, time, venue address" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">RSVP Details</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                        value={rsvp} 
                        onChange={e => setRSVP(e.target.value)} 
                        placeholder="e.g. RSVP by 1st December" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dress Code (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                        value={dressCode} 
                        onChange={e => setDressCode(e.target.value)} 
                        placeholder="e.g. Semi-Formal / Pastels" 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Theme Settings */}
          <div className="w-full">
            <button
              onClick={() => toggleSection('theme')}
              className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/30 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <PaintBrushIcon className="w-5 h-5 text-gray-400" />
                Theme & Layout Styling
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${activeSection === 'theme' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeSection === 'theme' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50/20 border-t border-gray-100 space-y-5 text-left">
                    {/* Theme Palettes grid */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Luxury Palettes</label>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_THEMES.map((th) => (
                          <button
                            key={th.key}
                            onClick={() => setSelectedThemeKey(th.key)}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              selectedThemeKey === th.key ? 'border-[#C89B3C] bg-white ring-1 ring-[#C89B3C]' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex gap-0.5">
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: th.primary }}></span>
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: th.secondary }}></span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 text-center truncate w-full">{th.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Google Fonts selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Typography Font</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none cursor-pointer"
                        value={selectedFontFamily}
                        onChange={(e) => setSelectedFontFamily(e.target.value)}
                      >
                        {FONTS.map(f => (
                          <option key={f.family} value={f.family}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Background Settings */}
                    <div className="border-t border-gray-100 pt-4 space-y-4">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Canvas Background & Borders</label>
                      
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Background Texture</span>
                        <div className="grid grid-cols-2 gap-2">
                          {BACKGROUND_TEXTURES.map((tx) => (
                            <button
                              key={tx.key}
                              onClick={() => setSelectedTexture(tx.key)}
                              className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                selectedTexture === tx.key 
                                  ? 'bg-[#C89B3C] text-white border-[#C89B3C]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {tx.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Border Frame Style</span>
                        <div className="grid grid-cols-2 gap-2">
                          {BORDER_STYLES.map((br) => (
                            <button
                              key={br.key}
                              onClick={() => setSelectedBorder(br.key)}
                              className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                selectedBorder === br.key 
                                  ? 'bg-[#C89B3C] text-white border-[#C89B3C]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {br.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Top Decorative Icon</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {DECORATIVE_ICONS.map((ic) => (
                            <button
                              key={ic.key}
                              onClick={() => setSelectedIcon(ic.key)}
                              className={`px-2 py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                selectedIcon === ic.key 
                                  ? 'bg-[#C89B3C] text-white border-[#C89B3C]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {ic.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Canvas Blur ({bgBlur}px)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="8" 
                          value={bgBlur}
                          onChange={(e) => setBgBlur(Number(e.target.value))}
                          className="w-full accent-[#C89B3C] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Overlay Opacity ({bgOpacity}%)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={bgOpacity}
                          onChange={(e) => setBgOpacity(Number(e.target.value))}
                          className="w-full accent-[#C89B3C] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Ambient Background Music */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MusicalNoteIcon className="w-4 h-4 text-[#C89B3C]" />
                        Ambient Background Music
                      </label>
                      
                      <div className="space-y-2">
                        <select
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none cursor-pointer"
                          value={selectedAudioKey}
                          onChange={(e) => {
                            setSelectedAudioKey(e.target.value);
                            setIsPlaying(e.target.value !== 'none');
                          }}
                        >
                          {AUDIO_TRACKS.map(track => (
                            <option key={track.key} value={track.key}>{track.name}</option>
                          ))}
                        </select>

                        {selectedAudioKey !== 'none' && (
                          <button
                            type="button"
                            onClick={() => setIsPlaying(prev => !prev)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            {isPlaying ? (
                              <>
                                <PauseIcon className="w-4 h-4 text-red-500 fill-red-500" />
                                <span>Pause Ambient Stream</span>
                              </>
                            ) : (
                              <>
                                <PlayIcon className="w-4 h-4 text-green-500 fill-green-500" />
                                <span>Play Ambient Stream</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Photo Upload */}
          <div className="w-full">
            <button
              onClick={() => toggleSection('photo')}
              className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/30 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <PhotoIcon className="w-5 h-5 text-gray-400" />
                Upload Photo / Logo
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${activeSection === 'photo' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeSection === 'photo' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50/20 border-t border-gray-100 space-y-4 text-left">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:border-[#C89B3C] transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <CloudArrowUpIcon className="w-8 h-8 text-[#C89B3C] mb-2" />
                      <span className="text-xs font-bold text-gray-800">Upload Couple Photo / Logo</span>
                      <span className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG, JPEG</span>
                    </div>

                    {logo && (
                      <div className="space-y-3 bg-white border border-gray-100 p-4 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-700">Preview Image Settings</span>
                          <button 
                            onClick={() => setLogo(null)}
                            className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">Image Zoom ({photoZoom}%)</label>
                          <input 
                            type="range" 
                            min="50" 
                            max="200" 
                            value={photoZoom}
                            onChange={(e) => setPhotoZoom(Number(e.target.value))}
                            className="w-full accent-[#C89B3C] cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">Rotate ({photoRotate}°)</label>
                          <input 
                            type="range" 
                            min="-180" 
                            max="180" 
                            value={photoRotate}
                            onChange={(e) => setPhotoRotate(Number(e.target.value))}
                            className="w-full accent-[#C89B3C] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 4: RSVP & QR Generator */}
          <div className="w-full">
            <button
              onClick={() => toggleSection('qrcode')}
              className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/30 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <QrCodeIcon className="w-5 h-5 text-gray-400" />
                Live QR Code Generator
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${activeSection === 'qrcode' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeSection === 'qrcode' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50/20 border-t border-gray-100 space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">QR Code Target</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'none', label: 'None' },
                          { key: 'rsvp', label: 'RSVP Form' },
                          { key: 'maps', label: 'Google Maps' },
                          { key: 'whatsapp', label: 'WhatsApp' }
                        ].map((qrOpt) => (
                          <button
                            key={qrOpt.key}
                            type="button"
                            onClick={() => {
                              setQrType(qrOpt.key);
                              if (qrOpt.key === 'rsvp') setQrValue(rsvpLink);
                            }}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              qrType === qrOpt.key 
                                ? 'bg-[#C89B3C] text-white border-[#C89B3C]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {qrOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {qrType !== 'none' && qrType !== 'rsvp' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target URL Link</label>
                        <input 
                          type="url" 
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                          value={qrValue} 
                          onChange={e => setQrValue(e.target.value)} 
                          placeholder="https://maps.google.com/?q=..." 
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 5: Guest List & Delivery */}
          <div className="w-full">
            <button
              onClick={() => toggleSection('guestlist')}
              className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/30 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                Guest List & Broadcast
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${activeSection === 'guestlist' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeSection === 'guestlist' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50/20 border-t border-gray-100 space-y-5 text-left">
                    
                    {/* Send Single Email */}
                    <form onSubmit={handleSendEmail} className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Send via Email</label>
                      <div className="flex gap-2">
                        <input 
                          type="email" 
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          placeholder="guest@example.com" 
                        />
                        <button 
                          type="submit" 
                          disabled={sending || !email}
                          className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {sending ? 'Sending' : 'Send'}
                        </button>
                      </div>
                      {sendResult && !csvError && (
                        <div className={`text-xs font-bold mt-1.5 ${sendResult.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                          {sendResult}
                        </div>
                      )}
                    </form>

                    {/* CSV Guest List */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Upload Guest CSV (Mass Delivery)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".csv" 
                          onChange={handleCSVUpload}
                          className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C89B3C]/10 file:text-[#C89B3C] hover:file:bg-[#C89B3C]/15 file:cursor-pointer"
                        />
                      </div>
                      {csvError && <div className="text-xs font-bold text-red-500">{csvError}</div>}
                      {guestList.length > 0 && (
                        <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-gray-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700">Preview ({guestList.length} guests)</span>
                            <button onClick={() => setGuestList([])} className="text-red-500 font-bold hover:underline cursor-pointer">Clear</button>
                          </div>
                          <ul className="max-h-24 overflow-y-auto text-[11px] font-semibold text-gray-500 bg-gray-50/50 p-2 rounded-lg divide-y divide-gray-100">
                            {guestList.map((g, i) => (
                              <li key={i} className="py-1">{g.name ? `${g.name} <${g.email}>` : g.email}</li>
                            ))}
                          </ul>
                          <button 
                            type="button" 
                            onClick={handleSendBulkEmails} 
                            disabled={sending}
                            className="w-full py-3 bg-[#C89B3C] text-white rounded-xl text-xs font-bold hover:bg-[#b58931] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {sending ? (
                              <>
                                <ArrowPathIcon className="animate-spin w-4 h-4" />
                                <span>Broadcasting...</span>
                              </>
                            ) : (
                              <span>Broadcast to All</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 6: Share & Download */}
          <div className="w-full font-sans">
            <button
              onClick={() => toggleSection('share')}
              className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/30 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <ShareIcon className="w-5 h-5 text-gray-400" />
                Share & Export Invite
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${activeSection === 'share' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeSection === 'share' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50/20 border-t border-gray-100 space-y-4 text-left">
                    <div className="flex gap-3">
                      <button 
                        onClick={handleDownloadImage} 
                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <DocumentArrowDownIcon className="w-4.5 h-4.5" />
                        PNG Image
                      </button>
                      <button 
                        onClick={handleDownloadPDF} 
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <DocumentArrowDownIcon className="w-4.5 h-4.5" />
                        PDF Document
                      </button>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-4.5 space-y-3.5 flex flex-col items-center">
                      <div className="text-xs font-bold text-gray-700">Scan QR Code or copy invite link:</div>
                      
                      <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-inner">
                        <QRCodeCanvas value={rsvpLink} size={100} fgColor={activeTheme.primary} />
                      </div>

                      <a 
                        href={whatsappUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors text-center cursor-pointer block"
                      >
                        Send RSVP Link on WhatsApp
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(rsvpLink);
                          alert('Invitation link copied to clipboard!');
                        }}
                        className="w-full py-3 border border-gray-200 text-gray-600 hover:text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer text-center"
                      >
                        Copy RSVP Web Link
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Right Viewport Invitation Preview: order-1 on mobile (at top), order-2 on desktop */}
      <div 
        id="live-preview-viewport"
        className="flex-1 flex flex-col items-center bg-[#F9F9F9] border border-gray-150 rounded-[28px] p-4 sm:p-8 min-h-[480px] justify-center relative order-1 lg:order-2"
      >
        <span className="absolute top-6 left-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:inline">
          Live Preview
        </span>

        {/* Live Preview canvas frame */}
        <div 
          ref={previewRef}
          style={{
            backgroundColor: activeTheme.bg,
            color: activeTheme.text,
            fontFamily: `'${selectedFontFamily}', serif`,
            boxShadow: '0 25px 70px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.03)',
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
            opacity: bgOpacity / 100,
            maxWidth: '380px',
            ...getTextureStyle(),
            ...getBorderStyle()
          }}
          className="w-full aspect-[10/16] rounded-[24px] flex flex-col justify-between items-center text-center border relative overflow-hidden transition-all duration-300 min-h-[560px]"
        >
          {/* Top border decoration */}
          <div 
            style={{ borderColor: activeTheme.primary }}
            className="w-16 border-t-2 border-dashed opacity-40 mb-2" 
          />

          <div className="flex-grow flex flex-col justify-center items-center gap-5 w-full">
            
            {/* Top Wreath / Decorative Icon Selection */}
            {selectedIcon !== 'none' && (
              <span className="text-3xl text-center select-none leading-none opacity-85 block mb-1">
                {DECORATIVE_ICONS.find(i => i.key === selectedIcon)?.char}
              </span>
            )}

            {/* Logo / Image Rendering */}
            {logo && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md relative z-10 flex-shrink-0">
                <img 
                  src={logo} 
                  alt="Couple profile" 
                  style={{
                    transform: `scale(${photoZoom / 100}) rotate(${photoRotate}deg)`,
                    transformOrigin: 'center'
                  }}
                  className="object-cover w-full h-full transition-transform duration-200"
                />
              </div>
            )}

            {/* Header Text */}
            <h4 
              style={{ color: activeTheme.primary }}
              className="text-[12px] sm:text-[13px] font-bold tracking-[3px] uppercase opacity-90 px-4 leading-relaxed"
            >
              {header}
            </h4>

            {/* Names / Couple names */}
            <h2 
              style={{ color: activeTheme.text }}
              className="text-3xl sm:text-4xl leading-tight font-black whitespace-pre-line tracking-tight px-2"
            >
              {names}
            </h2>

            {/* Invitation Body */}
            <p 
              className="text-xs sm:text-sm font-medium leading-relaxed opacity-70 px-4 whitespace-pre-line italic"
            >
              {body}
            </p>

            {/* Details (Venue & Date) */}
            <div 
              style={{ backgroundColor: `${activeTheme.primary}06`, borderColor: `${activeTheme.primary}20` }}
              className="text-xs sm:text-sm leading-relaxed border p-4.5 rounded-2xl w-full whitespace-pre-line font-medium opacity-90 border-dashed"
            >
              {details}
            </div>

            {/* Dress code & RSVP footer */}
            {dressCode && (
              <div className="text-[10px] font-black tracking-widest uppercase opacity-60">
                👗 DRESS CODE: {dressCode}
              </div>
            )}
          </div>

          {/* QR Code and RSVP Bottom elements */}
          <div className="w-full flex flex-col items-center gap-3.5 mt-5">
            
            {/* Conditionally rendering QR on Card */}
            {qrType !== 'none' && qrValue && (
              <div className="p-2 bg-white rounded-xl shadow-md border border-gray-150">
                <QRCodeCanvas value={qrValue} size={64} fgColor={activeTheme.primary} />
              </div>
            )}

            <div 
              style={{ color: activeTheme.primary }}
              className="text-xs font-bold tracking-[2px] uppercase opacity-90 border-t border-dashed w-full pt-4 border-gray-200/50"
            >
              {rsvp}
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Shortcut Bar for Action Buttons */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center gap-4">
        <button
          onClick={scrollToPreview}
          className="text-xs font-bold text-gray-700 flex items-center gap-1 hover:text-[#C89B3C] cursor-pointer"
        >
          👁️ Live Preview
        </button>
        <span className="h-4 w-px bg-gray-200" />
        <button
          onClick={() => {
            setActiveSection('share');
            const panel = document.querySelector('.divide-y');
            panel?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }}
          className="text-xs font-bold text-gray-700 flex items-center gap-1 hover:text-[#C89B3C] cursor-pointer"
        >
          📤 Export
        </button>
      </div>

    </div>
  );
}