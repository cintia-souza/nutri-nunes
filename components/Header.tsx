'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const NAV_PUBLIC = [
  { href: '/#sobre', label: 'Sobre' },
  { href: '/#servicos', label: 'Serviços' },
  { href: '/#planos', label: 'Planos' },
  { href: '/agendamento', label: 'Agendar' },
  { href: '/blog', label: 'Blog' },
];

const NAV_ADMIN = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/clientes', label: 'Pacientes' },
  { href: '/admin/dietas', label: 'Dietas' },
  { href: '/admin/receitas', label: 'Receitas' },
  { href: '/admin/agendamentos', label: 'Agenda' },
  { href: '/admin/servicos', label: 'Serviços' },
  { href: '/admin/planos', label: 'Planos' },
  { href: '/admin/avaliacoes', label: 'Avaliações' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/configuracoes', label: 'Config' },
];

const NAV_CLIENTE = [
  { href: '/cliente', label: 'Minha Dieta' },
  { href: '/cliente/agendamento', label: 'Agendar' },
  { href: '/cliente/receitas', label: 'Receitas' },
  { href: '/cliente/progresso', label: 'Progresso' },
  { href: '/cliente/avaliacao', label: 'Avaliar' },
  { href: '/cliente/perfil', label: 'Perfil' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const isCliente = pathname.startsWith('/cliente');
  const isAuth = isAdmin || isCliente;

  const navLinks = isAdmin ? NAV_ADMIN : isCliente ? NAV_CLIENTE : NAV_PUBLIC;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  function isActive(href: string) {
    if (href === '/admin' || href === '/cliente') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="glass border-b border-cream-200/60 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between" aria-label="Navegação principal">
        <Link href={isAdmin ? '/admin' : isCliente ? '/cliente' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-sage-800 to-sage-500 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
            <span className="text-white font-bold text-sm tracking-tight relative">A</span>
            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sage-300/70" />
          </div>
          <span className="text-lg font-bold text-warm-800 hidden sm:block">
            Adriana<span className="text-sage-600 font-normal"> Nutrição</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
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
              className="ml-3 bg-sage-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-sage-700 shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] flex items-center"
            >
              Portal do Paciente
            </Link>
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
      {menuOpen && (
        <div className="md:hidden glass border-t border-cream-200/60 animate-fade-slide-in">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl transition-all text-base ${
                  isActive(link.href) ? 'text-sage-700 bg-sage-50 font-medium' : 'text-warm-700 hover:text-sage-700 hover:bg-sage-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuth ? (
              <button onClick={handleLogout} className="w-full text-left text-danger px-4 py-3 rounded-xl hover:bg-red-50 mt-2">Sair</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block bg-sage-600 text-white text-center px-4 py-3 rounded-xl font-medium mt-2">
                Portal do Paciente
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
