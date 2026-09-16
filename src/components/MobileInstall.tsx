import React, { useEffect, useState } from "react";
export function MobileInstall() {
  const [prompt, setPrompt] = useState<any>(null);
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    const done = () => {
      setStandalone(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  if (standalone) return null;
  return (
    <section className="surface my-8">
      <h2 className="font-bold">Vênus no seu celular</h2>
      <p className="text-sm">
        Adicione à tela inicial para acessar o site como aplicativo. Reservas e
        disponibilidade precisam de conexão com a internet.
      </p>
      {prompt ? (
        <button
          className="action mt-3"
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice;
            setPrompt(null);
          }}
        >
          Instalar aplicativo
        </button>
      ) : (
        <p className="text-sm mt-2">
          No menu do navegador, procure “Instalar aplicativo” ou “Adicionar à
          Tela de Início”. No iPhone, use o menu Compartilhar do Safari.
        </p>
      )}
    </section>
  );
}
