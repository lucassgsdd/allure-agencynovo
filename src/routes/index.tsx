import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { AllureLandingPage } from "@/components/AllureLandingPage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Allure Agency — Gestão de carreira para criadoras" },
      {
        name: "description",
        content:
          "Allure Agency: gestão de carreira profissional, legalizada e transparente para criadoras de conteúdo adultas maiores de 18 anos.",
      },
      { property: "og:title", content: "Allure Agency — Gestão de carreira para criadoras" },
      {
        property: "og:description",
        content: "Gestão profissional, legalizada e orientada por estratégia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: "/css/index-BxDwndXW.css" }],
  }),
});

function formatWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Index() {
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('input[data-mask="whatsapp"], input[name="WhatsApp"]');
    const cleanups: Array<() => void> = [];

    if (input) {
      const onInput = () => {
        // Count digits before the caret so it can be restored in the same logical spot.
        const caret = input.selectionStart ?? input.value.length;
        const digitsBefore = input.value.slice(0, caret).replace(/\D/g, "").length;
        const formatted = formatWhatsapp(input.value);
        if (formatted === input.value) return;
        input.value = formatted;
        let seen = 0;
        let pos = formatted.length;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i]!)) {
            seen++;
            if (seen === digitsBefore) {
              pos = i + 1;
              break;
            }
          }
        }
        if (digitsBefore === 0) pos = formatted.length;
        input.setSelectionRange(pos, pos);
      };
      input.addEventListener("input", onInput);
      cleanups.push(() => input.removeEventListener("input", onInput));
    }

    const form = document.querySelector<HTMLFormElement>('form[data-ajax="formsubmit"], form.contact-form');
    if (form) {
      const onSubmit = async (event: Event) => {
        event.preventDefault();
        const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        const originalLabel = button?.innerHTML ?? "";
        if (button) {
          button.disabled = true;
          button.innerHTML = "Enviando...";
        }

        const data: Record<string, string> = { _captcha: "false" };
        new FormData(form).forEach((value, key) => {
          if (key.startsWith("_")) return;
          data[key] = String(value);
        });
        data["_subject"] = "Nova candidatura - Allure Agency";

        try {
          const res = await fetch("https://formsubmit.co/ajax/allureagencymodelss@gmail.com", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("request failed");
          form.reset();
          toast.success("Candidatura enviada com sucesso! Entraremos em contato em breve.");
        } catch {
          toast.error("Não foi possível enviar. Tente novamente em instantes.");
        } finally {
          if (button) {
            button.disabled = false;
            button.innerHTML = originalLabel;
          }
        }
      };
      form.addEventListener("submit", onSubmit);
      cleanups.push(() => form.removeEventListener("submit", onSubmit));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <AllureLandingPage />;
}
