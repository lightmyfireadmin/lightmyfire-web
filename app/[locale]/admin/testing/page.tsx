'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCurrentLocale, useI18n } from '@/locales/client';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface DatabaseStats {
  userCount: number;
  orderCount: number;
  lighterCount: number;
  postCount: number;
}

interface TestScenario {
  id: string;
  category: string;
  title: string;
  steps: string[];
  action?: {
    label: string;
    url: string;
    testData?: any;
  };
}

export default function AdminTestingPage() {
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n() as any;
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [checkedScenarios, setCheckedScenarios] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/${locale}/login`);
        return;
      }

            const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push(`/${locale}`);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      router.push(`/${locale}`);
    }
  }, [router, locale]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError('');

    try {
      const response = await fetch('/api/admin/verify-testing-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setAuthenticated(true);
        fetchStats();
      } else {
        setPasswordError(data.error || 'Incorrect password');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError('Failed to verify password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  const testScenarios: TestScenario[] = [
    {
      id: 'payment-flow',
      category: 'Payment & Orders',
      title: 'Complete Payment Flow Test',
      steps: [
        'Navigate to Save Lighter page',
        'Select pack size (10, 20, or 50 stickers)',
        'Add lighter names and customize',
        'Fill shipping address (test autocomplete)',
        'Select shipping method',
        'Use Stripe test card: 4242 4242 4242 4242',
        'Verify order creation and email receipt',
        'Check My Orders page for tracking info'
      ],
      action: {
        label: 'Start Payment Test',
        url: `/${locale}/save-lighter`,
      }
    },
    {
      id: 'address-autocomplete',
      category: 'Address & Shipping',
      title: 'Address Autocomplete Test',
      steps: [
        'Go to Save Lighter checkout',
        'Type "1600 Pennsylvania" in address field',
        'Verify OpenStreetMap suggestions appear',
        'Select an address from dropdown',
        'Verify city, postal code, and country auto-fill',
        'Test with international addresses (FR, DE, GB)'
      ],
      action: {
        label: 'Test Address Input',
        url: `/${locale}/save-lighter`,
      }
    },
    {
      id: 'order-tracking',
      category: 'Order Management',
      title: 'Order Tracking & Status Updates',
      steps: [
        'Complete a test order',
        'Navigate to My Orders page',
        'Verify order appears with correct status',
        'Check shipping address display',
        'Verify tracking information (if shipped)',
        'Test customer support contact link'
      ],
      action: {
        label: 'View My Orders',
        url: `/${locale}/my-orders`,
      }
    },
    {
      id: 'lighter-posts',
      category: 'Community Features',
      title: 'Lighter Posts & Search',
      steps: [
        'Create a new lighter post with image',
        'Add location using map picker',
        'Upload YouTube video link',
        'Search for lighters by name',
        'Filter by location proximity',
        'Test PIN entry for lighter claiming'
      ],
      action: {
        label: 'Browse Lighters',
        url: `/${locale}`,
      }
    },
    {
      id: 'authentication',
      category: 'Authentication',
      title: 'Login & Registration Flow',
      steps: [
        'Test email/password registration',
        'Verify email confirmation',
        'Test login with credentials',
        'Test password reset flow',
        'Verify session persistence',
        'Test logout functionality'
      ],
      action: {
        label: 'Go to Login',
        url: `/${locale}/login`,
      }
    },
    {
      id: 'printful-integration',
      category: 'Printful Integration',
      title: 'Printful Order Fulfillment',
      steps: [
        'Complete test order (Stripe test mode)',
        'Check database for printful_order_id',
        'Verify Printful dashboard shows order',
        'Test webhook for status updates',
        'Verify email notifications sent',
        'Check live shipping rate calculation'
      ],
      action: {
        label: 'Test Sticker Generation',
        url: '#sticker-generator',
      }
    },
    {
      id: 'i18n-localization',
      category: 'Internationalization',
      title: 'Language & Localization',
      steps: [
        'Switch between EN, FR, ES languages',
        'Verify all UI text translates correctly',
        'Check date/currency formatting',
        'Test language persistence',
        'Verify meta tags and SEO in each language',
        'Test RTL support if applicable'
      ],
      action: {
        label: 'Test Language Switcher',
        url: `/${locale}`,
      }
    },
    {
      id: 'responsive-design',
      category: 'UI/UX',
      title: 'Responsive Design & Accessibility',
      steps: [
        'Test on mobile (375px width)',
        'Test on tablet (768px width)',
        'Test on desktop (1920px width)',
        'Verify navigation menu works on mobile',
        'Test keyboard navigation',
        'Check screen reader compatibility',
        'Verify color contrast ratios'
      ],
      action: {
        label: 'Open Homepage',
        url: `/${locale}`,
      }
    }
  ];

  function handleScenarioCheck(scenarioId: string, stepIndex: number) {
    const key = `${scenarioId}-${stepIndex}`;
    setCheckedScenarios(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function handleQuickAction(url: string, testData?: any) {
    if (url.startsWith('#')) {
            const element = document.querySelector(url);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
            window.open(url, '_blank');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            🔒 Admin Testing Dashboard
          </h1>
          <p className="text-muted-foreground mb-6">
            Enter password to access testing tools
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            🧪 Admin Testing Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing tools and database statistics
          </p>
        </div>

        {}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            📊 Database Statistics
          </h2>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">{stats.userCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Users</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">{stats.orderCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Orders</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">{stats.lighterCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Lighters</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">{stats.postCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Posts</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          )}
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Refresh Stats
          </button>
        </div>

        {}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            ✅ Test Scenarios
          </h2>
          <div className="space-y-6">
            {testScenarios.map((scenario) => (
              <div key={scenario.id} className="border border-border rounded-lg p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                      {scenario.category}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {scenario.title}
                    </h3>
                  </div>
                  {scenario.action && (
                    <button
                      onClick={() => handleQuickAction(scenario.action!.url, scenario.action!.testData)}
                      className="mt-3 md:mt-0 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 whitespace-nowrap"
                    >
                      {scenario.action.label} →
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {scenario.steps.map((step, idx) => (
                    <label key={idx} className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={checkedScenarios[`${scenario.id}-${idx}`] || false}
                        onChange={() => handleScenarioCheck(scenario.id, idx)}
                        className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">{step}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div id="sticker-generator" className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            🏷️ Sticker Generation Test Tool
          </h2>
          <p className="text-muted-foreground mb-4">
            Use this tool to test sticker generation for specific events or to verify design changes.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Important:</strong> Sticker generation uses the live Printful API. Test orders will create real orders in your Printful account. Make sure to cancel them manually if not needed.
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => window.open('/api/generate-printful-stickers-test', '_blank')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90"
            >
              Open Sticker Generation Test API
            </button>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2"><strong>Test Parameters:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Pack sizes: 10, 20, or 50 stickers</li>
                <li>Custom lighter names</li>
                <li>Background colors: Any hex color</li>
                <li>Languages: EN, FR, ES</li>
              </ul>
            </div>
          </div>
        </div>

        {}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            🗺️ Sitemap & Documentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Public Routes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href={`/${locale}`} target="_blank" className="text-primary hover:underline">
                    / - Homepage & Lighter Search
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/save-lighter`} target="_blank" className="text-primary hover:underline">
                    /save-lighter - Order Stickers
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/dont-throw-me-away`} target="_blank" className="text-primary hover:underline">
                    /dont-throw-me-away - Refill Guide
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/legal/faq`} target="_blank" className="text-primary hover:underline">
                    /legal/faq - How It Works
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/login`} target="_blank" className="text-primary hover:underline">
                    /login - Authentication
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Protected Routes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href={`/${locale}/my-orders`} target="_blank" className="text-primary hover:underline">
                    /my-orders - Order Tracking
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/my-profile`} target="_blank" className="text-primary hover:underline">
                    /my-profile - User Profile
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/lighter/[id]`} target="_blank" className="text-primary hover:underline">
                    /lighter/[id] - Lighter Details
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/lighter/[id]/add`} target="_blank" className="text-primary hover:underline">
                    /lighter/[id]/add - Add Post
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/admin`} target="_blank" className="text-primary hover:underline">
                    /admin - Admin Dashboard
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-3">External Documentation</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://stripe.com/docs/testing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-muted text-foreground rounded-md text-sm hover:bg-muted/80"
              >
                Stripe Testing Docs →
              </a>
              <a
                href="https://developers.printful.com/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-muted text-foreground rounded-md text-sm hover:bg-muted/80"
              >
                Printful API Docs →
              </a>
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-muted text-foreground rounded-md text-sm hover:bg-muted/80"
              >
                Supabase Docs →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
