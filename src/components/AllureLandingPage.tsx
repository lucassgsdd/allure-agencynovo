// Allure Agency static composition: no motion imports, animation wrappers, or scroll-driven behavior.
import { ScrollReveal } from "@/components/ScrollReveal";
import { allureHtml } from "@/lib/allure-html";

type ElementSlice = {
  opening: string;
  outer: string;
  inner: string;
  className: string;
  id?: string;
};

function readAttribute(opening: string, name: string): string | undefined {
  return opening.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1];
}

function getElement(source: string, marker: string, tag: string): ElementSlice {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Elemento não encontrado: ${marker}`);

  const start = source.lastIndexOf("<", markerIndex);
  const openEnd = source.indexOf(">", start);
  const elementPattern = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "gi");
  elementPattern.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = elementPattern.exec(source))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      const opening = source.slice(start, openEnd + 1);
      return {
        opening,
        outer: source.slice(start, elementPattern.lastIndex),
        inner: source.slice(openEnd + 1, match.index),
        className: readAttribute(opening, "class") ?? "",
        id: readAttribute(opening, "id"),
      };
    }
  }

  throw new Error(`Fechamento não encontrado: ${marker}`);
}

function getArticles(source: string): ElementSlice[] {
  return (source.match(/<article\b[\s\S]*?<\/article>/gi) ?? []).map((outer) => {
    const openEnd = outer.indexOf(">");
    const opening = outer.slice(0, openEnd + 1);
    return {
      opening,
      outer,
      inner: outer.slice(openEnd + 1, -10),
      className: readAttribute(opening, "class") ?? "",
      id: readAttribute(opening, "id"),
    };
  });
}

const main = getElement(allureHtml, "<main", "main");
const hero = getElement(main.inner, 'class="hero"', "section");
const about = getElement(main.inner, 'class="about section"', "section");
const services = getElement(main.inner, 'class="services section"', "section");
const processSection = getElement(main.inner, 'class="process section"', "section");
const proof = getElement(main.inner, 'class="proof section"', "section");
const contact = getElement(main.inner, 'class="contact section"', "section");
const footer = getElement(main.inner, "<footer", "footer");

const heroPhoto = getElement(hero.inner, 'class="hero-photo"', "div");
const heroShade = getElement(hero.inner, 'class="hero-shade"', "div");
const heroNav = getElement(hero.inner, "<nav", "nav");
const heroContent = getElement(hero.inner, 'class="hero-content"', "div");
const heroTitle = getElement(heroContent.inner, "<h1", "h1");
const heroAgeNotice = getElement(hero.inner, 'class="hero-side-note', "p");
const scrollCue = getElement(hero.inner, 'class="scroll-cue"', "a");
const heroBeforeTitle = heroContent.inner.slice(0, heroContent.inner.indexOf(heroTitle.outer));
const heroAfterTitle = heroContent.inner.slice(heroContent.inner.indexOf(heroTitle.outer) + heroTitle.outer.length);

const servicesHeading = getElement(services.inner, 'class="services-heading"', "div");
const serviceList = getElement(services.inner, 'class="service-list"', "div");
const servicesCta = getElement(services.inner, 'class="section-cta"', "div");
const serviceItems = getArticles(serviceList.inner);

const proofLabel = getElement(proof.inner, 'class="section-label"', "div");
const ceosWrap = getElement(proof.inner, 'class="ceos-wrap"', "div");
const ceosTitle = getElement(ceosWrap.inner, 'class="ceos-title"', "h2");
const ceosLead = getElement(ceosWrap.inner, 'class="ceos-lead"', "p");
const ceosGrid = getElement(ceosWrap.inner, 'class="ceos-grid"', "div");
const ceoCards = getArticles(ceosGrid.inner);

function Html({ content }: { content: string }) {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: content }} />;
}

export function AllureLandingPage() {
  return (
    <main className="allure-page">
      <section className={hero.className} id={hero.id}>
        <div className={heroPhoto.className} aria-hidden="true" />
        <div className={heroShade.className} aria-hidden="true" />
        <nav className={heroNav.className} aria-label="Navegação principal" dangerouslySetInnerHTML={{ __html: heroNav.inner }} />
        <div className={heroContent.className}>
          <Html content={heroBeforeTitle} />
          <h1 className={heroTitle.className} dangerouslySetInnerHTML={{ __html: heroTitle.inner }} />
          <Html content={heroAfterTitle} />
        </div>
        <div style={{ position: "absolute", bottom: "2rem", right: 0 }}>
          <ScrollReveal>
            <p
              className={heroAgeNotice.className}
              style={{ position: "static", right: "auto", bottom: "auto" }}
              dangerouslySetInnerHTML={{ __html: heroAgeNotice.inner }}
            />
          </ScrollReveal>
        </div>
        <a className={scrollCue.className} href="#sobre" aria-label="Rolar para conhecer a Allure" dangerouslySetInnerHTML={{ __html: scrollCue.inner }} />
      </section>

      <ScrollReveal>
        <section className={about.className} id={about.id} dangerouslySetInnerHTML={{ __html: about.inner }} />
      </ScrollReveal>

      <section className={services.className} id={services.id}>
        <div className={servicesHeading.className} dangerouslySetInnerHTML={{ __html: servicesHeading.inner }} />
        <ScrollReveal>
          <div className={serviceList.className}>
            {serviceItems.map((item, index) => (
              <article className={item.className} key={`service-${index}`} dangerouslySetInnerHTML={{ __html: item.inner }} />
            ))}
          </div>
        </ScrollReveal>
        <div className={servicesCta.className} dangerouslySetInnerHTML={{ __html: servicesCta.inner }} />
      </section>

      <section className={processSection.className} id={processSection.id} dangerouslySetInnerHTML={{ __html: processSection.inner }} />

      <section className={proof.className} id={proof.id}>
        <div className={proofLabel.className} dangerouslySetInnerHTML={{ __html: proofLabel.inner }} />
        <div className={ceosWrap.className}>
          <h2 className={ceosTitle.className} dangerouslySetInnerHTML={{ __html: ceosTitle.inner }} />
          <p className={ceosLead.className} dangerouslySetInnerHTML={{ __html: ceosLead.inner }} />
          <ScrollReveal>
            <div className={ceosGrid.className}>
              {ceoCards.map((card, index) => (
                <article className={card.className} key={`ceo-${index}`}>
                  {card.inner.includes("Lara Luisa") ? (
                    <a
                      href="https://lara-five-pi.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Conheça Lara Luisa"
                      style={{ display: "block", color: "inherit", textDecoration: "none" }}
                      dangerouslySetInnerHTML={{
                        __html: card.inner
                          .replace(/<a\b[^>]*class="([^"]*ceo-btn[^"]*)"[^>]*>/i, '<span class="$1">')
                          .replace("</a>", "</span>"),
                      }}
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: card.inner }} />
                  )}
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className={contact.className} id={contact.id} dangerouslySetInnerHTML={{ __html: contact.inner }} />
      <footer className={footer.className} dangerouslySetInnerHTML={{ __html: footer.inner }} />
    </main>
  );
}
