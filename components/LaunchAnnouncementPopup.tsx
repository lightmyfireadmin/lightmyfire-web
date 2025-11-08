'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ANNOUNCEMENT_CONTENT = {
  en: {
    title: "We are just beginning",
    content: `Hi! We are so excited to have you here. We are just starting this platform and are committed to make it even **better**. Don't hesitate to contact us at **support@lightmyfire.app** to share your **feedback & opinion**, we are looking forward to hearing from you! In the meantime, we apologise for any inconvenience resulting from implementing phase - you may run into a couple bugs, translation typos, super generic community posts made to test script functionality. Orders may take a **couple days more to arrive** than in the long run. Thank you sincerely for your **understanding** and thank you for visiting **lightmyfire.app**!`,
  },
  fr: {
    title: "Nous ne faisons que commencer",
    content: `Salut ! Nous sommes si heureux de vous accueillir ici. Nous venons de lancer cette plateforme et nous nous engageons à la rendre encore **meilleure**. N'hésitez pas à nous contacter à **support@lightmyfire.app** pour partager vos **retours & opinions**, nous avons hâte de vous lire ! En attendant, nous nous excusons pour tout désagrément lié à la phase de mise en œuvre - vous pourriez rencontrer quelques bugs, fautes de traduction, publications communautaires génériques faites pour tester les fonctionnalités. Les commandes peuvent prendre **quelques jours de plus** qu'à long terme. Merci sincèrement pour votre **compréhension** et merci de visiter **lightmyfire.app** !`,
  },
  de: {
    title: "Wir fangen gerade erst an",
    content: `Hallo! Wir freuen uns so sehr, dass Sie hier sind. Wir starten gerade diese Plattform und sind entschlossen, sie noch **besser** zu machen. Zögern Sie nicht, uns unter **support@lightmyfire.app** zu kontaktieren, um Ihr **Feedback & Ihre Meinung** zu teilen - wir freuen uns darauf, von Ihnen zu hören! In der Zwischenzeit entschuldigen wir uns für eventuelle Unannehmlichkeiten während der Implementierungsphase - Sie könnten auf ein paar Bugs, Übersetzungsfehler oder sehr generische Community-Posts stoßen, die zum Testen der Funktionen erstellt wurden. Bestellungen können **ein paar Tage länger dauern** als langfristig. Vielen Dank für Ihr **Verständnis** und danke, dass Sie **lightmyfire.app** besuchen!`,
  },
  es: {
    title: "Apenas estamos comenzando",
    content: `¡Hola! Estamos muy emocionados de tenerte aquí. Acabamos de iniciar esta plataforma y estamos comprometidos a hacerla aún **mejor**. No dudes en contactarnos en **support@lightmyfire.app** para compartir tus **comentarios y opiniones**, ¡esperamos saber de ti! Mientras tanto, pedimos disculpas por cualquier inconveniente durante la fase de implementación - podrías encontrar algunos errores, errores de traducción, publicaciones comunitarias genéricas creadas para probar funcionalidades. Los pedidos pueden tardar **un par de días más** que a largo plazo. Gracias sinceramente por tu **comprensión** y gracias por visitar **lightmyfire.app**!`,
  },
};

type Language = 'en' | 'fr' | 'de' | 'es';

export default function LaunchAnnouncementPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
        const dismissed = localStorage.getItem('launch-announcement-dismissed');

    if (!dismissed) {
            const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('launch-announcement-dismissed', 'true');
    }, 300);   };

  if (!isVisible) return null;

  const content = ANNOUNCEMENT_CONTENT[selectedLang];

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
      {}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {}
      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ opacity: 0.98, colorScheme: 'light' }}
      >
        {}
        <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 p-6 pb-8">
          {}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
            aria-label="Close announcement"
          >
            <X className="w-5 h-5" />
          </button>

          {}
          <div className="absolute top-4 left-4">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as Language)}
              className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 text-sm font-medium cursor-pointer hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="en" className="text-gray-900 bg-white">🇬🇧 English</option>
              <option value="fr" className="text-gray-900 bg-white">🇫🇷 Français</option>
              <option value="de" className="text-gray-900 bg-white">🇩🇪 Deutsch</option>
              <option value="es" className="text-gray-900 bg-white">🇪🇸 Español</option>
            </select>
          </div>

          {}
          <h2 className="text-3xl font-bold text-white text-center mt-8">
            {content.title}
          </h2>
        </div>

        {}
        <div className="p-8 bg-white">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed text-base">
              {renderContent(content.content)}
            </p>
          </div>

          {}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {selectedLang === 'fr' && "C'est compris !"}
              {selectedLang === 'de' && "Verstanden!"}
              {selectedLang === 'es' && "¡Entendido!"}
              {selectedLang === 'en' && "Got it!"}
            </button>
          </div>
        </div>

        {}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
      </div>
    </div>
  );
}
