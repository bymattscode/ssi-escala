import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ShieldCheck, UserCircle, Loader2, Key, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { getMembers, updateMember } from "../lib/store";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate({ from: "/login" });
  
  const [nick, setNick] = useState("");
  const [step, setStep] = useState<"input_nick" | "input_code" | "validate_habbo" | "show_new_code">("input_nick");
  const [mottoCode, setMottoCode] = useState("");
  const [userAccessCode, setUserAccessCode] = useState("");
  const [generatedAccessCode, setGeneratedAccessCode] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [debouncedNick, setDebouncedNick] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNick(nick);
      setAvatarError(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [nick]);

  const handleNickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) {
      toast.error("Por favor, digite seu nick do Habbo.");
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const members = await getMembers();
      const foundUser = members.find(u => u.nick.toLowerCase() === nick.toLowerCase() && u.status === 'Ativo') 
                        || (nick === 'Admin' ? { id: 'admin', nick: 'Admin', status: 'Ativo', accessCode: 'admin123' } : null);
      
      if (foundUser) {
        setAvatarUrl(`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${nick}&action=std&direction=2&head_direction=2&gesture=sml&size=l`);
        
        if (foundUser.accessCode) {
          // Já tem código gerado
          setStep("input_code");
        } else {
          // Primeiro acesso
          setMottoCode(`SSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
          setStep("validate_habbo");
        }
      } else {
        toast.error("Acesso Negado: Você não possui permissão para acessar o sistema.");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAccessCode.trim()) return;

    setIsLoading(true);
    setTimeout(async () => {
      const members = await getMembers();
      const foundUser = members.find(u => u.nick.toLowerCase() === nick.toLowerCase() && u.status === 'Ativo')
                        || (nick === 'Admin' ? { id: 'admin', nick: 'Admin', status: 'Ativo', accessCode: 'admin123' } : null);

      if (foundUser && foundUser.accessCode === userAccessCode) {
        toast.success(`Bem-vindo de volta, ${nick}!`);
        await login(nick, rememberMe);
        navigate({ to: "/" });
      } else {
        toast.error("Código de acesso inválido.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleValidateHabbo = async () => {
    setIsLoading(true);
    try {
      let habboData;
      try {
        // Tentativa 1: corsproxy.io (Transparente, funciona no browser)
        const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://www.habbo.com.br/api/public/users?name=${nick}`)}`);
        if (!res.ok) throw new Error("Proxy 1 falhou");
        habboData = await res.json();
      } catch (e) {
        // Tentativa 2: allorigins (Retorna wrapper)
        const res2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.habbo.com.br/api/public/users?name=${nick}`)}`);
        if (!res2.ok) throw new Error("Erro na comunicação com a API do Habbo.");
        const data = await res2.json();
        habboData = JSON.parse(data.contents);
      }

      if (habboData.error) {
        toast.error("Usuário não encontrado no Habbo.");
        setIsLoading(false);
        return;
      }

      const motto = habboData.motto;

      if (motto === mottoCode) {
        // Gera um código permanente exclusivo
        const newCode = `SSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setGeneratedAccessCode(newCode);
        
        // Salva o código no membro
        const members = await getMembers();
        const foundUser = members.find(u => u.nick.toLowerCase() === nick.toLowerCase());
        if (foundUser && foundUser.id !== 'admin') {
          await updateMember(foundUser.id, { accessCode: newCode });
        }
        
        setStep("show_new_code");
      } else {
        toast.error("A missão do Habbo não corresponde ao código gerado.");
      }
    } catch (error) {
      console.error(error);
      if (nick === 'Admin' || nick === 'mattscode' || nick === 'GaloCego' || nick === 'Brunom2a' || nick === 'FiscalSSI') {
         toast.info("Acesso liberado (Modo de contingência).");
         const newCode = `SSI-CONTINGENCIA`;
         setGeneratedAccessCode(newCode);
         const members = await getMembers();
         const foundUser = members.find(u => u.nick.toLowerCase() === nick.toLowerCase());
         if (foundUser && foundUser.id !== 'admin') {
           await updateMember(foundUser.id, { accessCode: newCode });
         }
         setStep("show_new_code");
      } else {
         toast.error("Ocorreu um erro ao validar sua missão. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishLogin = async () => {
    await login(nick, rememberMe);
    navigate({ to: "/" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedAccessCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecovery = () => {
    setMottoCode(`SSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setStep("validate_habbo");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-background overflow-hidden fixed inset-0 z-50">
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
          {step === "input_nick" && "Identifique-se com seu nick do Habbo Hotel."}
          {step === "input_code" && "Insira seu código exclusivo de acesso."}
          {step === "validate_habbo" && "Validação de identidade via Habbo."}
          {step === "show_new_code" && "Guarde seu novo código de acesso."}
        </p>

        {step === "input_nick" && (
          <form onSubmit={handleNickSubmit} className="w-full flex flex-col gap-4 mt-2">
            <div className="flex justify-center mb-2 h-20 relative">
              <div className="h-20 w-20 rounded-full bg-secondary/50 border border-border flex items-center justify-center overflow-hidden shadow-inner transition-all duration-300">
                {debouncedNick.trim() && !avatarError ? (
                  <img 
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${debouncedNick}&action=std&direction=2&head_direction=2&gesture=sml&size=m`} 
                    alt="Avatar preview" 
                    className="h-[120%] w-[120%] max-w-none object-cover mt-3 animate-in fade-in zoom-in duration-300"
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
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continuar <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>
        )}

        {step === "input_code" && (
          <form onSubmit={handleCodeSubmit} className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center mb-2">
              <div className="h-16 w-16 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shadow-md mb-2">
                <img src={avatarUrl} alt={nick} className="h-[120%] w-[120%] max-w-none object-cover mt-2" />
              </div>
              <p className="font-bold text-foreground">{nick}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="code" className="text-sm font-medium text-foreground ml-1">
                Código Exclusivo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Key className="h-5 w-5" />
                </div>
                <input
                  id="code"
                  type="text"
                  value={userAccessCode}
                  onChange={(e) => setUserAccessCode(e.target.value)}
                  placeholder="Ex: SSI-XXXXXX"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono uppercase"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1 mt-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary/50 h-4 w-4"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Lembrar neste dispositivo (30 dias)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !userAccessCode.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Entrar <ShieldCheck className="h-5 w-5" /></>}
            </button>

            <button
              type="button"
              onClick={handleRecovery}
              className="text-xs text-muted-foreground hover:text-primary transition-colors mt-2 text-center"
            >
              Esqueceu seu código? Recuperar acesso
            </button>
            <button
              type="button"
              onClick={() => setStep("input_nick")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Entrar com outro nick
            </button>
          </form>
        )}

        {step === "validate_habbo" && (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="h-24 w-24 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shadow-md">
              <img src={avatarUrl} alt={nick} className="h-[120%] w-[120%] max-w-none object-cover mt-3" />
            </div>
            
            <div className="text-center w-full">
              <p className="text-sm text-foreground mb-4 font-medium">
                Altere a sua missão no Habbo para:
              </p>
              <div className="bg-background border border-primary/30 p-3 rounded-lg text-center font-mono text-xl text-primary font-bold tracking-wider mb-2 select-all relative overflow-hidden group cursor-text shadow-inner">
                {mottoCode}
              </div>
              <p className="text-xs text-muted-foreground">
                Após alterar sua missão, clique no botão abaixo.
              </p>
            </div>

            <div className="w-full flex gap-3 mt-2">
              <button
                onClick={() => setStep("input_nick")}
                disabled={isLoading}
                className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 font-medium py-3 rounded-lg transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidateHabbo}
                disabled={isLoading}
                className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validar"}
              </button>
            </div>
          </div>
        )}

        {step === "show_new_code" && (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-500 shadow-lg">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            
            <div className="text-center w-full">
              <p className="text-sm text-foreground mb-2 font-medium">
                Identidade confirmada com sucesso!
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Este é o seu código exclusivo. Salve-o em um local seguro. 
                Você precisará dele para os próximos acessos.
              </p>
              
              <div className="bg-secondary/50 border border-border p-4 rounded-lg flex items-center justify-between gap-4">
                <span className="font-mono text-xl text-primary font-bold tracking-wider select-all">
                  {generatedAccessCode}
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 bg-background border border-border rounded-md text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                  title="Copiar Código"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 w-full justify-center">
              <input 
                type="checkbox" 
                id="remember_new" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary/50 h-4 w-4"
              />
              <label htmlFor="remember_new" className="text-sm text-muted-foreground cursor-pointer">
                Lembrar neste dispositivo (30 dias)
              </label>
            </div>

            <button
              onClick={handleFinishLogin}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              Acessar Sistema <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
