import Link from 'next/link';
import { useI18n } from '@/locales/client';

type LighterInfo = {
  name: string;
  pin_code: string;
};

export default function SaveSuccessPage() {
  const params = useParams();
  const t = useI18n();
  const lighterId = params.id as string;
  const [lighter, setLighter] = useState<LighterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (lighterId) {
      const fetchLighterInfo = async () => {
        const { data, error } = await supabase
          .from('lighters')
          .select('name, pin_code')
          .eq('id', lighterId)
          .single();

        if (data) {
          setLighter(data);
        }
        setLoading(false);
      };
      fetchLighterInfo();
    }
  }, [lighterId]);

  const handleDownload = async () => {
    if (!lighter) return;
    setDownloading(true);
    await generateStickerPDF(lighter.name, lighter.pin_code);
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100"> {/* Keep muted bg for loading */}
        <p className="text-muted-foreground">{t('save_success.loading')}</p>
      </div>
    );
  }

  if (!lighter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">{t('save_success.lighter_not_found')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4"> {/* Muted bg */}
      <div className="w-full max-w-md rounded-lg bg-background p-8 text-center shadow-md"> {/* Theme bg */}
        <h1 className="mb-4 text-3xl font-bold text-green-600"> {/* Keep success green */}
          {t('save_success.title')}
        </h1>
        <p className="mb-6 text-lg text-foreground"> {/* Theme text */}
          {t('save_success.message', { lighterName: lighter.name })}
        </p>
        <p className="mb-2 text-muted-foreground">{t('save_success.pin_intro')}</p>
        <p className="mb-8 font-mono text-3xl font-bold text-foreground"> {/* Theme text */}
          {lighter.pin_code}
        </p>

        <div className="mb-8 rounded-lg border border-border bg-muted p-4 text-left text-sm text-foreground">
          <h4 className="mb-2 font-bold">
            {t('save_success.next_steps.title')}
          </h4>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>{t('save_success.next_steps.print_label')}:</strong>{' '}
              {t('save_success.next_steps.step1')}
            </li>
            <li>
              <strong>{t('save_success.next_steps.stick_label')}:</strong>{' '}
              {t('save_success.next_steps.step2')}
            </li>
            <li>
              <strong>{t('save_success.next_steps.share_label')}:</strong>{' '}
              {t('save_success.next_steps.step3')}
            </li>
          </ol>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary mb-4 w-full text-lg" // Applied btn-primary
        >
          {downloading ? t('save_success.button.generating') : t('save_success.button.download_pdf')}
        </button>

        <Link
          href={`/lighter/${lighterId}`}
          className="btn-secondary block w-full text-lg" // Applied btn-secondary, added block
        >
          {t('save_success.button.go_to_lighter')}
        </Link>
      </div>
    </div>
  );
}