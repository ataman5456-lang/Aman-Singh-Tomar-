import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  Wifi,
  CreditCard,
  User,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface QRCodeGeneratorProps {
  lang: Language;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ lang }) => {
  const t = useTranslation(lang);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [qrType, setQrType] = useState<
    'url' | 'text' | 'wifi' | 'upi' | 'contact' | 'phone' | 'email' | 'sms'
  >('url');

  // Input states
  const [url, setUrl] = useState('https://pocketlife.app');
  const [plainText, setPlainText] = useState('Hello from Pocket Life App!');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState('Secret123');
  const [wifiSec, setWifiSec] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [upiVpa, setUpiVpa] = useState('pocketlife@upi');
  const [upiName, setUpiName] = useState('Pocket Life Store');
  const [upiAmount, setUpiAmount] = useState('500');
  const [upiNote, setUpiNote] = useState('Grocery Payment');
  const [contactName, setContactName] = useState('Rahul Sharma');
  const [contactPhone, setContactPhone] = useState('+919876543210');
  const [contactEmail, setContactEmail] = useState('rahul@example.com');
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [emailTo, setEmailTo] = useState('support@pocketlife.app');
  const [emailSubject, setEmailSubject] = useState('Hello Pocket Life');
  const [smsNumber, setSmsNumber] = useState('+919876543210');
  const [smsText, setSmsText] = useState('Hey, let us catch up!');

  // Style states
  const [fgColor, setFgColor] = useState('#8B5CF6'); // Purple
  const [bgColor, setBgColor] = useState('#0B071A'); // Dark Violet
  const [copied, setCopied] = useState(false);

  // Construct target string based on type
  const getEncodedData = (): string => {
    switch (qrType) {
      case 'url':
        return url.startsWith('http') ? url : `https://${url}`;
      case 'text':
        return plainText;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiSec};P:${wifiPass};;`;
      case 'upi': {
        const params = new URLSearchParams();
        params.set('pa', upiVpa);
        if (upiName) params.set('pn', upiName);
        if (upiAmount) params.set('am', upiAmount);
        params.set('cu', 'INR');
        if (upiNote) params.set('tn', upiNote);
        return `upi://pay?${params.toString()}`;
      }
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
      case 'phone':
        return `tel:${phoneNumber}`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'sms':
        return `smsto:${smsNumber}:${smsText}`;
      default:
        return 'https://pocketlife.app';
    }
  };

  // Render QR Code onto canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const data = getEncodedData();
    if (!data.trim()) return;

    QRCode.toCanvas(
      canvasRef.current,
      data,
      {
        width: 280,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) console.error('QR generation error:', err);
      }
    );
  }, [
    qrType,
    url,
    plainText,
    wifiSsid,
    wifiPass,
    wifiSec,
    upiVpa,
    upiName,
    upiAmount,
    upiNote,
    contactName,
    contactPhone,
    contactEmail,
    phoneNumber,
    emailTo,
    emailSubject,
    smsNumber,
    smsText,
    fgColor,
    bgColor,
  ]);

  // Download High-Res PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    soundManager.playTap();
    const link = document.createElement('a');
    link.download = `pocketlife-qr-${qrType}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    soundManager.playSuccess();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    soundManager.playTap();
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.clipboard && 'write' in navigator.clipboard) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          soundManager.playSuccess();
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch {
      // Fallback
    }
  };

  const typeTabs = [
    { id: 'url', label: t.qrText.types.url, icon: Globe },
    { id: 'text', label: t.qrText.types.text, icon: QrCode },
    { id: 'wifi', label: t.qrText.types.wifi, icon: Wifi },
    { id: 'upi', label: t.qrText.types.upi, icon: CreditCard },
    { id: 'contact', label: t.qrText.types.contact, icon: User },
    { id: 'phone', label: t.qrText.types.phone, icon: Phone },
    { id: 'email', label: t.qrText.types.email, icon: Mail },
    { id: 'sms', label: t.qrText.types.sms, icon: MessageSquare },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Type Selector Horizontal Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {typeTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playTap();
                setQrType(tab.id as typeof qrType);
              }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-medium ${
                qrType === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-purple-950/30 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t.qrText.content}</span>
          </h3>

          {/* URL Input */}
          {qrType === 'url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.qrText.types.url}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.qrText.urlPlaceholder}
                className="w-full px-3 py-2.5 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          )}

          {/* Plain Text */}
          {qrType === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.qrText.types.text}
              </label>
              <textarea
                rows={3}
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder={t.qrText.textPlaceholder}
                className="w-full p-3 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          )}

          {/* Wi-Fi Config */}
          {qrType === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.wifiSsid}
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="e.g. Home_Network"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.wifiPass}
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.wifiSec}
                </label>
                <select
                  value={wifiSec}
                  onChange={(e) => setWifiSec(e.target.value as typeof wifiSec)}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value="WPA" className="bg-[#120B24]">WPA/WPA2</option>
                  <option value="WEP" className="bg-[#120B24]">WEP</option>
                  <option value="nopass" className="bg-[#120B24]">None (Open)</option>
                </select>
              </div>
            </div>
          )}

          {/* UPI Payment */}
          {qrType === 'upi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.upiVpa} *
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="name@okaxis or user@upi"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {t.qrText.upiName}
                  </label>
                  <input
                    type="text"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    placeholder="Merchant Name"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {t.qrText.upiAmount} (₹)
                  </label>
                  <input
                    type="number"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.upiNote}
                </label>
                <input
                  type="text"
                  value={upiNote}
                  onChange={(e) => setUpiNote(e.target.value)}
                  placeholder="Payment description"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Contact vCard */}
          {qrType === 'contact' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.contactName}
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {t.qrText.contactPhone}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {t.qrText.contactEmail}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone Call */}
          {qrType === 'phone' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.qrText.types.phone}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          )}

          {/* Email */}
          {qrType === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.emailTo}
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.emailSubject}
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* SMS */}
          {qrType === 'sms' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.smsNumber}
                </label>
                <input
                  type="tel"
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.qrText.smsMessage}
                </label>
                <textarea
                  rows={2}
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Type SMS text..."
                  className="w-full p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Colors Customizer */}
          <div className="pt-2 border-t border-purple-500/15">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              {t.qrText.customize}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-purple-950/20 p-2 rounded-xl border border-purple-500/20">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs text-slate-300">{t.qrText.fgColor}</span>
              </div>

              <div className="flex items-center gap-2 bg-purple-950/20 p-2 rounded-xl border border-purple-500/20">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs text-slate-300">{t.qrText.bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Actions */}
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 dark:bg-[#090514] border border-purple-500/30 shadow-2xl flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-xl shadow-inner max-w-full" />
          </div>

          <div className="text-xs text-purple-300 font-medium">
            {t.qrText.offlineGenerated}
          </div>

          <div className="flex items-center gap-2 w-full max-w-xs">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t.qrText.downloadPng}</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="py-2.5 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              title={t.qrText.copyImage}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
