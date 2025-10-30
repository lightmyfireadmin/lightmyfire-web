import ClientSaveSuccess from './client-save-success';

export default function Page({ params }: { params: { locale: string; id: string } }) {
  return <ClientSaveSuccess id={params.id} locale={params.locale} />;
}