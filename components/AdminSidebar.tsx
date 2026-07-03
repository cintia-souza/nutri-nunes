'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { href: '/admin',                icon: '🏠', label: 'Dashboard'   },
  { href: '/admin/clientes',       icon: '👥', label: 'Pacientes'   },
  { href: '/admin/dietas',         icon: '🥗', label: 'Dietas'      },
  { href: '/admin/receitas',       icon: '📖', label: 'Receitas'    },
  { href: '/admin/agendamentos',   icon: '📅', label: 'Agenda'      },
  { href: '/admin/servicos',       icon: '🩺', label: 'Serviços'    },
  { href: '/admin/planos',         icon: '💳', label: 'Planos'      },
  { href: '/admin/avaliacoes',     icon: '⭐', label: 'Avaliações'  },
  { href: '/admin/blog',           icon: '✏️', label: 'Blog'        },
  { href: '/admin/configuracoes',  icon: '⚙️', label: 'Config'      },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" style={{filter:'brightness(0) invert(1)', maxWidth:'150px'}} />
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all ml-auto"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu admin">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item.href)
                ? 'text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            style={isActive(item.href) ? {backgroundColor:'rgba(255,122,85,0.25)', color:'white'} : {}}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && isActive(item.href) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-coral-400" style={{backgroundColor:'#ff7a55'}} />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'}`}>
          <ThemeToggle />
          {!collapsed && <span className="text-xs text-white/40">Tema</span>}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sair' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/20 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col sticky top-0 h-screen shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? '64px' : '220px',
          background: 'linear-gradient(180deg,#0f3d29 0%,#1a8558 100%)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile: top bar com botão hamburguer */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-[73px] z-40 border-b border-cream-200/60" style={{background:'linear-gradient(90deg,#0f3d29,#1a8558)'}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" style={{filter:'brightness(0) invert(1)', maxWidth:'130px'}} />
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col animate-fade-slide-in" style={{background:'linear-gradient(180deg,#0f3d29,#1a8558)'}}>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
