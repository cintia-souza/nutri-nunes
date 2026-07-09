'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { LayoutDashboard, Users, Salad, BookOpen, UtensilsCrossed, CalendarDays, Briefcase, CreditCard, Star, PenSquare, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, LineChart, type LucideIcon } from 'lucide-react';

const NAV: { href: string; icon: LucideIcon; label: string }[] = [
  { href: '/admin',                icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/admin/clientes',       icon: Users,           label: 'Pacientes'   },
  { href: '/admin/diario',         icon: BookOpen,        label: 'Diário'      },
  { href: '/admin/dietas',         icon: Salad,           label: 'Dietas'      },
  { href: '/admin/relatorio',      icon: LineChart,       label: 'Relatório'   },
  { href: '/admin/receitas',       icon: UtensilsCrossed, label: 'Receitas'    },
  { href: '/admin/agendamentos',   icon: CalendarDays,    label: 'Agenda'      },
  { href: '/admin/servicos',       icon: Briefcase,       label: 'Serviços'    },
  { href: '/admin/planos',         icon: CreditCard,      label: 'Planos'      },
  { href: '/admin/avaliacoes',     icon: Star,            label: 'Avaliações'  },
  { href: '/admin/blog',           icon: PenSquare,       label: 'Blog'        },
  { href: '/admin/configuracoes',  icon: Settings,        label: 'Config'      },
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
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
            <item.icon className="w-[18px] h-[18px] shrink-0" />
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
          <LogOut className="w-4 h-4 shrink-0" />
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
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
