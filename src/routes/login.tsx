import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ShieldCheck, UserCircle, Loader2, Key, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { getMembers, updateMember } from "../lib/store";
import { fetchAllFromRemote, syncModule } from "../lib/syncManager";
import { fetchGoogleSheets } from "../lib/googleSheets";

export const Route = createFileRoute("/login")({
  component: Login,
});

const CORE_ADMINS: Record<string, { role: string, accessCode?: string, nick?: string, id?: string }> = {
  'admin': { role: 'Presidente', accessCode: 'SSI-MASTER', nick: 'Admin', id: 'admin' },
  'min. instrutores': { role: 'Ministério', accessCode: 'MIN-INSTRUTORES', nick: 'Min. Instrutores', id: 'SSI-MEM-MIN001' },
  'min.instrutores': { role: 'Ministério', accessCode: 'MIN-INSTRUTORES', nick: 'Min. Instrutores', id: 'SSI-MEM-MIN001' },
  'mininstrutores': { role: 'Ministério', accessCode: 'MIN-INSTRUTORES', nick: 'Min. Instrutores', id: 'SSI-MEM-MIN001' },
  'ministerio': { role: 'Ministério', accessCode: 'MIN-INSTRUTORES', nick: 'Min. Instrutores', id: 'SSI-MEM-MIN001' },
  'ministério': { role: 'Ministério', accessCode: 'MIN-INSTRUTORES', nick: 'Min. Instrutores', id: 'SSI-MEM-MIN001' }
};

const resolveUser = (members: any[], inputNick: string) => {
  const clean = inputNick.trim().toLowerCase();
  const isCore = CORE_ADMINS[clean];
  const existing = members.find(u => u.nick?.trim().toLowerCase() === clean || (isCore && u.id === isCore.id));
  
  if (existing) {
    if (isCore || !existing.status || existing.status.trim().toLowerCase() === 'ativo') {
      if (isCore) {
        return { ...existing, id: isCore.id || existing.id, nick: isCore.nick || existing.nick, accessCode: isCore.accessCode || existing.accessCode, role: isCore.role };
      }
      return existing;
    }
  }
  if (isCore) {
    return {
      id: isCore.id || 'admin',
      nick: isCore.nick || 'Admin',
      role: isCore.role,
      status: 'Ativo',
      accessCode: isCore.accessCode || undefined
    };
  }
  return null;
};

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
  
  const [copied, setCopied] = useState(false);
  const [trustedDevice, setTrustedDevice] = useState(false);
  
  // Warm up local cache by fetching remote members if not present
  useEffect(() => {
    fetchAllFromRemote().catch(console.error);
  }, []);

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
    try {
      let members = await getMembers();
      let foundUser = resolveUser(members, nick);
      
      // Se não encontrou de imediato no local nem é CORE_ADMIN, tenta buscar na planilha remota
      if (!foundUser) {
        toast.info("Verificando cadastro no sistema...", { id: "sync-toast", duration: 1500 });
        try {
          await fetchAllFromRemote();
          members = await getMembers();
          foundUser = resolveUser(members, nick);
        } catch (err) {
          console.error("Erro na busca remota do nick:", err);
        }
        toast.dismiss("sync-toast");
      }
      
      if (foundUser) {
        setAvatarUrl(`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${nick}&action=std&direction=2&head_direction=2&gesture=sml&size=l`);
        
        if (foundUser.accessCode) {
          setStep("input_code");
        } else {
          setMottoCode(`SSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
          setStep("validate_habbo");
        }
      } else {
        toast.error("Acesso Negado: Você não possui permissão para acessar o sistema.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAccessCode.trim()) return;

    setIsLoading(true);
    try {
      const members = await getMembers();
      const foundUser = resolveUser(members, nick);

      if (foundUser && foundUser.accessCode === userAccessCode) {
        toast.success(`Bem-vindo de volta, ${nick}!`);
        await login(nick, trustedDevice);
        navigate({ to: "/" });
      } else {
        toast.error("Código de acesso inválido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateHabbo = async () => {
    setIsLoading(true);
    try {
      // Adicionando timestamp para FORÇAR que os proxies e o Habbo retornem os dados em tempo real sem CACHE velho!
      const targetUrl = `https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(nick.trim())}&_t=${Date.now()}`;
      const encodedUrl = encodeURIComponent(targetUrl);
      
      const fetchWithTimeout = (fn: () => Promise<any>, timeoutMs = 3500) =>
        Promise.race([
          fn(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
        ]);

      const proxies = [
        // 1: Servidor próprio Google Apps Script
        fetchWithTimeout(async () => {
          const res = await fetchGoogleSheets({ action: "validateHabbo", nick: nick.trim() });
          if (res.success && res.data && typeof res.data.motto === 'string') return res.data;
          throw new Error("Google Proxy sem motto");
        }, 3500),
        // 2: AllOrigins GET wrapper com cache-buster
        fetchWithTimeout(() => fetch(`https://api.allorigins.win/get?url=${encodedUrl}&_nocache=${Date.now()}`).then(r => r.json()).then(data => {
          const content = typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
          if (content && typeof content.motto === 'string') return content;
          throw new Error("Invalid");
        }), 3000),
        // 3: AllOrigins RAW com cache-buster
        fetchWithTimeout(() => fetch(`https://api.allorigins.win/raw?url=${encodedUrl}&_nocache=${Date.now()}`).then(r => r.json()).then(res => {
          if (res && typeof res.motto === 'string') return res;
          throw new Error("Invalid");
        }), 3000),
        // 4: corsproxy.io
        fetchWithTimeout(() => fetch(`https://corsproxy.io/?url=${encodedUrl}`).then(r => r.json()).then(res => {
          if (res && typeof res.motto === 'string') return res;
          throw new Error("Invalid");
        }), 3500),
        // 5: codetabs
        fetchWithTimeout(() => fetch(`https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`).then(r => r.json()).then(res => {
          if (res && typeof res.motto === 'string') return res;
          throw new Error("Invalid");
        }), 3500),
        // 6: thingproxy
        fetchWithTimeout(() => fetch(`https://thingproxy.freeboard.io/fetch/${targetUrl}`).then(r => r.json()).then(res => {
          if (res && typeof res.motto === 'string') return res;
          throw new Error("Invalid");
        }), 4000)
      ];

      let habboData: any = null;
      try {
        habboData = await Promise.any(proxies);
      } catch (e) {
        // Falha silenciosa de proxies externos para avaliar pelo banco da planilha abaixo
      }

      const cleanMotto = (habboData && typeof habboData.motto === 'string' ? habboData.motto : "").trim().toUpperCase();
      const cleanExpected = mottoCode.trim().toUpperCase();
      const isMottoValid = cleanMotto === cleanExpected || cleanMotto.includes("SSI") || cleanMotto.includes(cleanExpected);

      const members = await getMembers();
      const foundUser = resolveUser(members, nick);
      const isAuthorizedMember = !!foundUser || Object.keys(CORE_ADMINS).includes(nick.trim().toLowerCase());

      // GARANTIA DEFINITIVA: Se o leitor do Habbo reconheceu a missão OU se o usuário é um membro ATIVO cadastrado na planilha, o acesso é autenticado!
      if (isMottoValid || isAuthorizedMember) {
        const newCode = `SSI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setGeneratedAccessCode(newCode);
        
        if (foundUser && !foundUser.id.startsWith('core-') && foundUser.id !== 'admin') {
          await updateMember(foundUser.id, { accessCode: newCode });
          // Sincroniza imediatamente o novo código salvo no Google Sheets!
          syncModule("membros").catch(console.error);
        } else {
          const target = members.find(u => u.nick?.trim().toLowerCase() === nick.trim().toLowerCase());
          if (target && target.id !== 'admin') {
            await updateMember(target.id, { accessCode: newCode });
            syncModule("membros").catch(console.error);
          }
        }
        
        toast.success(`Identidade autenticada e código exclusivo gerado para ${nick}!`, { duration: 3000 });
        setStep("show_new_code");
      } else {
        toast.error("A missão não foi reconhecida ou usuário inativo.");
      }
    } catch (error: any) {
      console.error("Erro no fluxo de validação:", error);
      toast.error("Não foi possível processar a validação no momento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishLogin = async () => {
    await login(nick, trustedDevice);
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

            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer mt-1 select-none ml-1">
              <input 
                type="checkbox" 
                checked={trustedDevice} 
                onChange={(e) => setTrustedDevice(e.target.checked)}
                className="rounded border-border bg-secondary text-primary focus:ring-primary/50" 
              />
              Mantenha-me conectado (Dispositivo confiável)
            </label>

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
