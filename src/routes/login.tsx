import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ShieldCheck, UserCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate({ from: "/login" });
  const [nick, setNick] = useState("");
  const [step, setStep] = useState<"input" | "validate">("input");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [debouncedNick, setDebouncedNick] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNick(nick);
      setAvatarError(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [nick]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) {
      toast.error("Por favor, digite seu nick do Habbo.");
      return;
    }

    setIsLoading(true);
    // Simular busca para checar na whitelist
    setTimeout(async () => {
      const isValid = await login(nick);
      if (isValid) {
        setAvatarUrl(`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${nick}&action=std&direction=2&head_direction=2&gesture=sml&size=l`);
        setCode(`SSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
        setStep("validate");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        toast.error("Acesso Negado: Você não possui permissão para acessar o sistema.");
      }
    }, 800);
  };

  const handleValidate = async () => {
    setIsLoading(true);
    try {
      // Proxy público para contornar CORS
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.habbo.com.br/api/public/users?name=${nick}`)}`);
      
      if (!res.ok) {
        throw new Error("Erro na comunicação com a API do Habbo.");
      }

      const data = await res.json();
      const habboData = JSON.parse(data.contents);

      if (habboData.error) {
        toast.error("Usuário não encontrado no Habbo.");
        setIsLoading(false);
        return;
      }

      const motto = habboData.motto;

      if (motto === code) {
        toast.success(`Bem-vindo, ${nick}!`);
        await login(nick); // Atualiza sessão real
        navigate({ to: "/" });
      } else {
        toast.error("A missão do Habbo não corresponde ao código gerado.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      
      // Fallback para ambiente de teste (caso a API caia)
      if (nick === 'Admin' || nick === 'mattscode' || nick === 'GaloCego' || nick === 'Brunom2a' || nick === 'FiscalSSI' || nick === 'Policial123') {
         toast.info("Acesso liberado (Modo de contingência).");
         await login(nick);
         navigate({ to: "/" });
      } else {
         toast.error("Ocorreu um erro ao validar sua missão. Tente novamente.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-background overflow-hidden fixed inset-0 z-50">
      {/* Elementos decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 relative z-10 flex flex-col items-center">
        <div className="h-16 w-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center overflow-hidden p-2 mb-6 shadow-inner">
          <img src="/logo.png" alt="SSI Logo" className="h-full w-full object-contain" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2 text-center">
          Acesso Restrito - SSI
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Identifique-se com seu nick do Habbo Hotel para entrar.
        </p>

        {step === "input" ? (
          <form onSubmit={handleNext} className="w-full flex flex-col gap-4 mt-2">
            
            <div className="flex justify-center mb-2 h-20 relative">
              <div className="h-20 w-20 rounded-full bg-secondary/50 border border-border flex items-center justify-center overflow-hidden shadow-inner transition-all duration-300">
                {debouncedNick.trim() && !avatarError ? (
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${debouncedNick}&action=std&direction=2&head_direction=2&gesture=sml&size=m`} 
                    alt="Avatar preview" 
                    className="h-full w-full object-cover mt-2 scale-110 animate-in fade-in zoom-in duration-300"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-muted-foreground/50 animate-in fade-in duration-300" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="nick" className="text-sm font-medium text-foreground ml-1">
                Nick do Habbo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <UserCircle className="h-5 w-5" />
                </div>
                <input
                  id="nick"
                  type="text"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="Seu nick exato..."
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !nick.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Continuar <ShieldCheck className="h-5 w-5" /></>
              )}
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-24 w-24 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={nick} className="h-full w-full object-cover mt-2 scale-110" />
              ) : (
                <UserCircle className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            
            <div className="text-center w-full">
              <p className="text-sm text-foreground mb-4 font-medium">
                Altere a sua missão no Habbo para:
              </p>
              <div className="bg-background border border-primary/30 p-3 rounded-lg text-center font-mono text-xl text-primary font-bold tracking-wider mb-2 select-all relative overflow-hidden group cursor-text shadow-inner">
                {code}
              </div>
              <p className="text-xs text-muted-foreground">
                Após alterar sua missão, clique no botão abaixo.
              </p>
            </div>

            <div className="w-full flex gap-3 mt-2">
              <button
                onClick={() => setStep("input")}
                disabled={isLoading}
                className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 font-medium py-3 rounded-lg transition-all disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleValidate}
                disabled={isLoading}
                className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Validar Acesso"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
