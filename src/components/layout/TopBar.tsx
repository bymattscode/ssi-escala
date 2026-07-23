import { Bell, Search, UserCircle } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center bg-secondary/50 border border-border rounded-md px-3 py-1.5 w-64 focus-within:border-primary/50 transition-colors">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <input 
          type="text" 
          placeholder="Buscar..." 
          className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-border pl-4 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground leading-none">Admin</p>
            <p className="text-xs text-primary mt-1">Presidência</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <UserCircle className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
