import { UserCircle, HardDrive, Shield, CheckCircle2, RefreshCw, ChevronDown, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { getConfig, updateConfig, addSyncLog } from "../../lib/store";
import { backupToRemote } from "../../lib/syncManager";

interface TopBarProps {
  onMenuToggle?: () => void;
  isCollapsed?: boolean;
}

export function TopBar({ onMenuToggle, isCollapsed = false }: TopBarProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>("-");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const { user, role, userName, logout } = useAuth();
  const canBackup = role === "Ministério" || role === "Presidente" || role === "Vice-Presidente";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  useEffect(() => {
    const fetchBackup = async () => {
      const config = await getConfig();
      if (config.lastWrite) {
        setLastBackup(config.lastWrite);
      }
    };
    fetchBackup();
  }, []);

  const handleBackup = async () => {
    if (!canBackup) {
      toast.error("Permissão negada. Apenas Presidente pode executar backups.");
      return;
    }

    setIsBackingUp(true);
    toast.info("Iniciando backup dos dados para o Google Sheets...");

    try {
      const success = await backupToRemote();
      if (success) {
        const now = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
        await updateConfig({ lastWrite: now });
        setLastBackup(now);
        toast.success("Backup concluído e sincronizado na planilha Google Sheets com sucesso!");
      } else {
        toast.error("Ocorreu uma falha ao comunicar com a planilha. Verifique a configuração.");
      }
    } catch (error) {
      console.error("Erro no backup de emergência:", error);
      toast.error("Falha inesperada ao sincronizar backup manual.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <header className="h-16 bg-[#020817]/95 backdrop-blur-xl border-b border-border flex items-center justify-between fixed top-0 left-0 z-30 w-full shadow-[0_4px_30px_-4px_rgba(0,0,0,0.5)]">
      {/* Bloco Esquerdo: Retângulo da Marca (perfeitamente alinhado com a Sidebar) + Botão de Menu */}
      <div className="flex items-center h-full">
        <Link
          to="/"
          title="Ir para a página inicial"
          className={`${
            isCollapsed ? "w-16 md:w-20 md:justify-center md:px-0" : "w-auto md:w-64 px-3"
          } h-full border-r border-border flex items-center gap-2.5 transition-all duration-300 ease-in-out hover:bg-secondary/40 cursor-pointer shrink-0 select-none group`}
        >
          <div className="h-9 w-9 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center overflow-hidden p-1 shrink-0 group-hover:border-primary/50 transition-colors">
            <img src="/logo.png" alt="SSI Logo" className="h-full w-full object-contain" />
          </div>
          <div className={`flex flex-col min-w-0 ${isCollapsed ? "md:hidden" : "flex"}`}>
            <h1 className="text-foreground font-bold text-base leading-tight tracking-tight drop-shadow-md group-hover:text-primary transition-colors">
              SSI
            </h1>
            <span className="text-[10.5px] text-muted-foreground/80 font-medium leading-tight whitespace-nowrap hidden sm:block">
              Setor de Segurança dos Instrutores
            </span>
          </div>
        </Link>

        {/* Botão de alternar menu estilo RCCSystem */}
        <button 
          onClick={onMenuToggle}
          aria-label="Alternar Menu"
          title="Alternar Menu Lateral"
          className="p-2 ml-2 sm:ml-3 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6">
        <div className="group relative flex flex-col items-end">
          <button
            onClick={handleBackup}
            disabled={isBackingUp || !canBackup}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 border ${isBackingUp
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

        <div className="relative group/user">
          <div 
            className="flex items-center gap-3 border-l border-border pl-4 sm:pl-6 cursor-pointer group-hover/user:opacity-80 transition-opacity"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
          >
            <div className="text-right hidden md:flex md:flex-col md:items-end group-hover/user:text-primary transition-colors">
              <p className="text-sm font-medium text-foreground leading-none flex items-center justify-end gap-1 w-full">
                {userName} <ChevronDown className="h-3 w-3" />
              </p>
              <p className="text-xs text-primary/80 mt-1.5 pr-4">{role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary/80 border border-border group-hover/user:border-primary/50 group-hover/user:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover/user:text-primary transition-all duration-300 shadow-sm shrink-0 overflow-hidden">
              {user ? (
                <>
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.nick}&action=std&direction=2&head_direction=2&gesture=sml&size=m`} 
                    alt={userName} 
                    className="h-12 w-12 object-cover mt-2"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none'; 
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'; 
                      }
                    }} 
                  />
                  <UserCircle className="h-6 w-6 hidden" />
                </>
              ) : (
                <UserCircle className="h-6 w-6" />
              )}
            </div>
          </div>
          
          {showRoleMenu && (
            <div className="absolute right-0 top-12 mt-2 w-40 bg-card border border-border shadow-xl rounded-md overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col p-1">
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 text-sm rounded-md transition-colors text-red-400 hover:bg-red-950/30 hover:text-red-400 flex items-center gap-2 w-full font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
