'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Content configuration for the announcement popup, keyed by language code.
 */
const ANNOUNCEMENT_CONTENT = {
  en: {
    title: "We are just beginning",
    content: `Hello! I'm delighted to welcome you. This platform is still in pre-launch and aims to become even **better**. Don't hesitate to contact me at **mitch@lightmyfire.app** to share your **feedback & opinions**. It helps tremendously! Over the coming weeks, some inconveniences related to the launch phase may occur - you might encounter a few bugs, translation typos, or super generic posts created to test functionality. Orders may take **a few days longer** than in the long run. Thank you sincerely for your **understanding** and enjoy browsing **lightmyfire.app**!`,
  },
  fr: {
    title: "Nous ne faisons que commencer",
    content: `Hello ! Je suis ravi de t'accueillir. Cette plateforme est encore en pré-lancement et vise à devenir encore **meilleure**. N'hésite pas à me contacter à **mitch@lightmyfire.app** pour partager tes **retours & opinions**. Ça aide énormément ! Au cours des prochaines semaines, quelques désagréments liés à la phase de lancement peuvent survenir - tu pourrais rencontrer quelques bugs, coquilles de traduction, ou des publications super génériques créées pour tester les fonctionnalités. Les commandes peuvent prendre **quelques jours de plus** que sur le long terme. Merci sincèrement pour ta **compréhension** et bonne navigation sur **lightmyfire.app** !`,
  },
  de: {
    title: "Wir fangen gerade erst an",
    content: `Hallo! Ich freue mich, dich willkommen zu heißen. Diese Plattform befindet sich noch im Pre-Launch und strebt danach, noch **besser**. Zögere nicht, mich unter **mitch@lightmyfire.app** zu kontaktieren, um dein **Feedback & deine Meinung** zu teilen. Das hilft enorm! In den kommenden Wochen können einige Unannehmlichkeiten durch die Startphase auftreten - du könntest auf ein paar Bugs, Übersetzungsfehler oder super generische Beiträge stoßen, die zum Testen der Funktionen erstellt wurden. Bestellungen können **ein paar Tage länger dauern** als langfristig. Vielen Dank für dein **Verständnis** und viel Spaß beim Durchstöbern von **lightmyfire.app**!`,
  },
  es: {
    title: "Apenas estamos comenzando",
    content: `¡Hola! Estoy encantado de darte la bienvenida. Esta plataforma aún está en pre-lanzamiento y tiene como objetivo mejorar aún **más**. No dudes en contactarme en **mitch@lightmyfire.app** para compartir tus **comentarios y opiniones**. ¡Ayuda enormemente! Durante las próximas semanas, pueden ocurrir algunos inconvenientes relacionados con la fase de lanzamiento - podrías encontrar algunos bugs, errores de traducción o publicaciones súper genéricas creadas para probar funcionalidades. Los pedidos pueden tardar **unos días más** que a largo plazo. Gracias sinceramente por tu **comprensión** y disfruta navegando en **lightmyfire.app**!`,
  },
};

/**
 * Supported languages for the announcement popup.
 */
type Language = 'en' | 'fr' | 'de' | 'es';

/**
 * A popup component that displays a launch announcement message.
 *
 * Features:
 * - Appears once per user session (persisted via localStorage).
 * - Supports dynamic language switching within the modal.
 * - Renders markdown-style bold text.
 * - Includes a backdrop blur and animations.
 *
 * @returns {JSX.Element | null} The rendered popup component or null if not visible.
 */
export default function LaunchAnnouncementPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the announcement
    const dismissed = localStorage.getItem('launch-announcement-dismissed');

    if (!dismissed) {
      // Delay showing the popup slightly for better UX (avoids immediate pop-in on load)
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Closes the popup and marks it as dismissed in localStorage.
   * Triggers a closing animation before removing the component from the DOM.
   */
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('launch-announcement-dismissed', 'true');
    }, 300); // Wait for animation to finish
  };

  if (!isVisible) return null;

  const content = ANNOUNCEMENT_CONTENT[selectedLang];

  /**
   * Helper function to render text with bold formatting.
   * Parses strings containing `**text**` markers.
   *
   * @param {string} text - The text content to render.
   * @returns {Array<JSX.Element | string>} An array of text nodes and bold elements.
   */
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-primary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ opacity: 1, colorScheme: 'light', backgroundColor: '#ffffff' }}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 p-6 pb-8" style={{ background: 'linear-gradient(to right, #f97316, #ec4899, #a855f7)' }}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            style={{ color: '#ffffff' }}
            aria-label="Close announcement"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Language selector */}
          <div className="absolute top-4 left-4">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as Language)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/90 backdrop-blur-sm text-white border border-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-700/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600"
              style={{ colorScheme: 'dark', backgroundColor: 'rgba(31, 41, 55, 0.9)', color: '#ffffff' }}
            >
              <option value="en" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>🇬🇧 English</option>
              <option value="fr" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>🇫🇷 Français</option>
              <option value="de" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>🇩🇪 Deutsch</option>
              <option value="es" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>🇪🇸 Español</option>
            </select>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mt-8" style={{ color: '#ffffff !important', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            {content.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8" style={{ backgroundColor: '#ffffff' }}>
          <div className="prose prose-lg max-w-none">
            <p className="leading-relaxed text-base" style={{ color: '#1f2937' }}>
              {renderContent(content.content)}
            </p>
          </div>

          {/* Action button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleClose}
              className="px-8 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            >
              {selectedLang === 'fr' && "C'est compris !"}
              {selectedLang === 'de' && "Verstanden!"}
              {selectedLang === 'es' && "¡Entendido!"}
              {selectedLang === 'en' && "Got it!"}
            </button>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
      </div>
    </div>
  );
}
