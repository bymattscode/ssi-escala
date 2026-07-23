import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SSI" },
      { name: "description", content: "SSI — aplicativo em construção." },
      { property: "og:title", content: "SSI" },
      { property: "og:description", content: "SSI — aplicativo em construção." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium tracking-[0.3em] text-muted-foreground">
          ESBOÇO
        </p>
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground">
          SSI
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Estrutura inicial do aplicativo. Pronto para receber suas próximas ordens.
        </p>
      </div>
    </main>
  );
}
