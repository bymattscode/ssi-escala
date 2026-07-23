import { Search, UserCircle, HardDrive, Shield } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-[#020817]/95 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 z-30 w-full shadow-[0_4px_30px_-4px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
             <Shield className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
           </div>
           <div className="flex flex-col">
             <h1 className="text-foreground font-bold text-lg leading-tight tracking-tight drop-shadow-md">SSI</h1>
             <span className="text-xs text-muted-foreground/80 font-medium leading-tight">Setor de Segurança dos Instrutores</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/25 text-primary border border-primary/30 hover:border-primary/60 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_-2px_rgba(59,130,246,0.5)]">
          <HardDrive className="h-4 w-4" />
          Backup do Sistema
        </button>
        
        <div className="flex items-center gap-3 border-l border-border pl-6 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none group-hover:text-primary transition-colors">Admin</p>
            <p className="text-xs text-primary/80 mt-1">Presidência</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary/80 border border-border group-hover:border-primary/50 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all duration-300 shadow-sm">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
