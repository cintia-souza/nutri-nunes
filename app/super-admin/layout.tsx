export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Topbar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            N
          </div>
          <div>
            <span className="text-white font-semibold text-sm">NutriHub</span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              Super Admin
            </span>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit"
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            Sair
          </button>
        </form>
      </header>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
