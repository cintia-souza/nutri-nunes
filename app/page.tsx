import { redirect } from 'next/navigation';

// Redireciona a raiz para o tenant padrão.
// Quando migrar para domínio próprio com wildcard, esta página
// deixa de ser acessada — o middleware resolverá o slug pelo subdomínio.
export default function RootPage() {
  const slug = process.env.DEFAULT_TENANT_SLUG ?? process.env.TENANT_SLUG_DEV ?? '';
  if (!slug) redirect('/404');
  redirect(`/${slug}`);
}
