import { UserCircle, HardDrive, Shield, CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TopBar() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>("Hoje, 10:00");
  
  // Mock role (Presidência tem permissão de clique, Diretor apenas vê)
  const role = "Presidência"; 
  const canBackup = role === "Presidência" || role === "Vice-Presidência";

  const handleBackup = () => {
    if (!canBackup) {
      toast.error("Permissão negada. Apenas Presidência pode executar backups.");
      return;
    }

    setIsBackingUp(true);
    toast.info("Iniciando backup dos dados principais...");

    // Mock API call
    setTimeout(() => {
      setIsBackingUp(false);
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastBackup(`Hoje, ${now}`);
      toast.success("Backup concluído com sucesso! Dados exportados prontos para integração.");
    }, 2500);
  };

  return (
    <header className="h-16 bg-[#020817]/95 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 z-30 w-full ">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center overflow-hidden p-1">
             <img src="/logo.png" alt="SSI Logo" className="h-full w-full object-contain drop-" />
           </div>
           <div className="flex flex-col">
             <h1 className="text-foreground font-bold text-lg leading-tight tracking-tight drop-shadow-md">SSI</h1>
             <span className="text-xs text-muted-foreground/80 font-medium leading-tight hidden sm:block">Setor de Segurança dos Instrutores</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="group relative flex flex-col items-end">
          <button 
            onClick={handleBackup}
            disabled={isBackingUp || !canBackup}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 border ${
              isBackingUp 
                ? "bg-primary/20 text-primary border-primary/50 cursor-not-allowed" 
                : canBackup 
                  ? "bg-primary/10 hover:bg-primary/25 text-primary border-primary/30 hover:border-primary/60 cursor-pointer"
                  : "bg-secondary/30 text-muted-foreground border-border cursor-not-allowed"
            }`}
          >
            {isBackingUp ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : canBackup ? (
              <HardDrive className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isBackingUp ? "Salvando..." : "Backup do Sistema"}
            </span>
          </button>
          
          <div className="absolute top-12 right-0 w-max bg-card border border-border shadow-lg rounded-md p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <p className="text-muted-foreground">Último backup:</p>
            <p className="font-bold text-foreground">{lastBackup}</p>
            {!canBackup && <p className="text-red-400 mt-1">Somente visualização</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-3 border-l border-border pl-4 sm:pl-6 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none group-hover:text-primary transition-colors">Admin</p>
            <p className="text-xs text-primary/80 mt-1">{role}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary/80 border border-border group-hover:border-primary/50 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all duration-300 shadow-sm shrink-0">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
