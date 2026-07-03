'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_PUBLIC = [
  { href: '/#sobre', label: 'Sobre' },
  { href: '/#servicos', label: 'Serviços' },
  { href: '/#planos', label: 'Planos' },
  { href: '/blog', label: 'Blog' },
];

const NAV_CLIENTE = [
  { href: '/cliente', label: 'Minha Dieta' },
  { href: '/cliente/agendamento', label: 'Agendar' },
  { href: '/cliente/receitas', label: 'Receitas' },
  { href: '/cliente/progresso', label: 'Progresso' },
  { href: '/cliente/avaliacao', label: 'Avaliar' },
  { href: '/cliente/perfil', label: 'Perfil' },
];

function NavLinks({ links, pathname }: { links: typeof NAV_PUBLIC; pathname: string }) {
  function isActive(href: string) {
    if (href === '/admin' || href === '/cliente') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm px-3.5 py-2 rounded-xl transition-all duration-200 ${
            isActive(link.href)
              ? 'text-sage-700 bg-sage-50 font-medium'
              : 'text-warm-600 hover:text-sage-700 hover:bg-sage-50'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setReady(true); }, []);

  const isAdmin = pathname.startsWith('/admin');
  const isCliente = pathname.startsWith('/cliente');
  const isAuth = isAdmin || isCliente;
  const navLinks = isCliente ? NAV_CLIENTE : NAV_PUBLIC;

  if (isAdmin) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="glass border-b border-cream-200/60 sticky top-0 z-50" style={{boxShadow:'0 1px 0 rgba(34,160,107,0.08), 0 2px 12px rgba(0,0,0,0.04)'}}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between" aria-label="Navegação principal">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Adriana Nutrição" className="h-11 w-auto object-contain" style={{maxWidth:'220px'}} />

        </Link>

        {/* Desktop Nav — só renderiza após mount para evitar hydration mismatch */}
        <div className="hidden md:flex items-center gap-1" suppressHydrationWarning>
          {ready && (
            <>
              <NavLinks links={navLinks} pathname={pathname} />
              <ThemeToggle />
              {isAuth ? (
                <button
                  onClick={handleLogout}
                  className="ml-3 text-sm text-warm-500 hover:text-danger font-medium px-4 py-2 rounded-xl hover:bg-red-50/80 transition-all duration-200 min-h-[44px]"
                >
                  Sair
                </button>
              ) : (
                <Link
                  href="/login"
                  className="ml-3 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] flex items-center"
                  style={{backgroundColor:'#ff7a55'}}
                >
                  Portal do Paciente
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-sage-50 transition-colors"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <svg className="w-5 h-5 text-warm-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Nav */}
      {menuOpen && ready && (
        <div className="md:hidden glass border-t border-cream-200/60 animate-fade-slide-in">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl transition-all text-base text-warm-700 hover:text-sage-700 hover:bg-sage-50"
              >
                {link.label}
              </Link>
            ))}
            {isAuth ? (
              <button onClick={handleLogout} className="w-full text-left text-danger px-4 py-3 rounded-xl hover:bg-red-50 mt-2">Sair</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-white text-center px-4 py-3 rounded-xl font-medium mt-2" style={{backgroundColor:'#ff7a55'}}>
                Portal do Paciente
              </Link>
            )}
            <div className="flex items-center gap-2 px-4 pt-3 border-t border-cream-200 mt-2">
              <span className="text-xs text-warm-400">Tema:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
