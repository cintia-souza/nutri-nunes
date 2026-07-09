'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { User, CalendarDays, BookOpen, TrendingUp, Star, UserCircle, BarChart3, Info, Briefcase, CreditCard, PenSquare, LogOut, Menu, X, type LucideIcon } from 'lucide-react';

interface NavItem { href: string; label: string; icon: LucideIcon; }

const NAV_PUBLIC: NavItem[] = [
  { href: '/#sobre', label: 'Sobre', icon: Info },
  { href: '/#servicos', label: 'Serviços', icon: Briefcase },
  { href: '/#planos', label: 'Planos', icon: CreditCard },
  { href: '/blog', label: 'Blog', icon: PenSquare },
];

const NAV_CLIENTE: NavItem[] = [
  { href: '/cliente', label: 'Início', icon: Info },
  { href: '/cliente/dieta', label: 'Minha Dieta', icon: BookOpen },
  { href: '/cliente/habitos', label: 'Hábitos', icon: BarChart3 },
  { href: '/cliente/agendamento', label: 'Agendar', icon: CalendarDays },
  { href: '/cliente/progresso', label: 'Progresso', icon: TrendingUp },
  { href: '/cliente/avaliacao', label: 'Avaliar', icon: Star },
  { href: '/cliente/perfil', label: 'Perfil', icon: UserCircle },
];

function NavLinks({ links, pathname }: { links: NavItem[]; pathname: string }) {
  function isActive(href: string) {
    if (href === '/cliente') return pathname === href;
    return pathname.startsWith(href) && href !== '/cliente';
  }

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl transition-all duration-200 ${
            isActive(link.href)
              ? 'text-sage-700 bg-sage-50 font-medium'
              : 'text-warm-600 hover:text-sage-700 hover:bg-sage-50'
          }`}
        >
          <link.icon className="w-4 h-4" />
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1" suppressHydrationWarning>
          {ready && (
            <>
              <NavLinks links={navLinks} pathname={pathname} />
              <ThemeToggle />
              {isAuth ? (
                <button
                  onClick={handleLogout}
                  className="ml-3 flex items-center gap-1.5 text-sm text-warm-500 hover:text-danger font-medium px-4 py-2 rounded-xl hover:bg-red-50/80 transition-all duration-200 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              ) : (
                <Link
                  href="/login"
                  className="ml-3 flex items-center gap-1.5 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px]"
                  style={{backgroundColor:'#ff7a55'}}
                >
                  <User className="w-4 h-4" /> Portal do Paciente
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
          {menuOpen ? <X className="w-5 h-5 text-warm-700" /> : <Menu className="w-5 h-5 text-warm-700" />}
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base text-warm-700 hover:text-sage-700 hover:bg-sage-50"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            {isAuth ? (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 text-danger px-4 py-3 rounded-xl hover:bg-red-50 mt-2">
                <LogOut className="w-5 h-5" /> Sair
              </button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 text-white text-center px-4 py-3 rounded-xl font-medium mt-2" style={{backgroundColor:'#ff7a55'}}>
                <User className="w-5 h-5" /> Portal do Paciente
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
