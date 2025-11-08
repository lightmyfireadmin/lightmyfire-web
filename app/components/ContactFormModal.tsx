'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/locales/client';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
  context?: 'custom_branding' | 'faq' | 'general';
}

export default function ContactFormModal({
  isOpen,
  onClose,
  subject,
  context = 'general'
}: ContactFormModalProps) {
  const t = useI18n() as any;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getDefaultSubject = () => {
    if (subject) return subject;
    switch (context) {
      case 'custom_branding':
        return 'Custom Branding Inquiry';
      case 'faq':
        return 'Question about LightMyFire';
      default:
        return 'General Inquiry';
    }
  };

  const getDefaultMessage = () => {
    if (context === 'custom_branding') {
      return 'I\'m interested in custom branding for an event or organization. Please provide details about:\n\n- Event/Organization name:\n- Expected quantity:\n- Event date:\n- Special requirements:\n';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: getDefaultSubject(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 shadow-xl transition-all border border-border">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold text-foreground">
                    {t('contact.modal_title') || 'Contact Us'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-muted transition"
                  >
                    <XMarkIcon className="h-6 w-6 text-muted-foreground" />
                  </button>
                </div>

                {success ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-lg font-semibold text-primary">
                      {t('contact.success_message') || 'Message sent successfully!'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('contact.success_subtitle') || 'We\'ll get back to you soon.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                        {t('contact.name_label') || 'Name'} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t('contact.name_placeholder') || 'Your name'}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        {t('contact.email_label') || 'Email'} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t('contact.email_placeholder') || 'your.email@example.com'}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                        {t('contact.phone_label') || 'Phone'} ({t('contact.optional') || 'Optional'})
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t('contact.phone_placeholder') || '+33 6 12 34 56 78'}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                        {t('contact.message_label') || 'Message'} *
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message || getDefaultMessage()}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder={t('contact.message_placeholder') || 'How can we help you?'}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                        disabled={loading}
                      >
                        {t('contact.cancel') || 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (t('contact.sending') || 'Sending...') : (t('contact.send') || 'Send Message')}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
