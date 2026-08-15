// Allure Agency motion system: scroll-linked editorial reveals with proportional rewind.
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { allureHtml } from "@/lib/allure-html";

type ElementSlice = {
  tag: string;
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
  if (start < 0 || openEnd < 0) throw new Error(`Abertura inválida: ${marker}`);

  const elementPattern = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "gi");
  elementPattern.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = elementPattern.exec(source))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        const end = elementPattern.lastIndex;
        const opening = source.slice(start, openEnd + 1);
        return {
          tag,
          opening,
          outer: source.slice(start, end),
          inner: source.slice(openEnd + 1, match.index),
          className: readAttribute(opening, "class") ?? "",
          id: readAttribute(opening, "id"),
        };
      }
    } else {
      depth += 1;
    }
  }

  throw new Error(`Fechamento não encontrado: ${marker}`);
}

function getArticles(source: string): ElementSlice[] {
  const articles = source.match(/<article\b[\s\S]*?<\/article>/gi) ?? [];
  return articles.map((outer) => {
    const openEnd = outer.indexOf(">");
    const opening = outer.slice(0, openEnd + 1);
    return {
      tag: "article",
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

type RevealTag = "div" | "section" | "article" | "h1" | "h2" | "p" | "nav" | "span";

const motionElements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
  nav: motion.nav,
  span: motion.span,
} as const;

type ScrollLinkedRevealProps = {
  as?: RevealTag;
  className?: string;
  id?: string;
  children?: ReactNode;
  html?: string;
  distance?: number;
  ariaLabel?: string;
};

function ScrollLinkedReveal({
  as = "div",
  className,
  id,
  children,
  html,
  distance = 90,
  ariaLabel,
}: ScrollLinkedRevealProps) {
  const targetRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start bottom", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [distance, 0]);
  const Element = motionElements[as] as typeof motion.div;

  return (
    <Element
      ref={targetRef as never}
      className={className}
      id={id}
      aria-label={ariaLabel}
      style={reduceMotion ? { opacity: 1, y: 0 } : { opacity, y }}
      {...(html ? { dangerouslySetInnerHTML: { __html: html } } : {})}
    >
      {html ? null : children}
    </Element>
  );
}

export function AnimatedLandingPage() {
  return (
    <main className="allure-page">
      <section className={hero.className} id={hero.id}>
        <div className={heroPhoto.className} aria-hidden="true" />
        <div className={heroShade.className} aria-hidden="true" />
        <ScrollLinkedReveal
          as="nav"
          className={heroNav.className}
          aria-label="Navegação principal"
          distance={80}
          html={heroNav.inner}
        />
        <div className={heroContent.className}>
          <Html content={heroBeforeTitle} />
          <ScrollLinkedReveal
            as="h1"
            className={heroTitle.className}
            distance={100}
            html={heroTitle.inner}
          />
          <Html content={heroAfterTitle} />
        </div>
        <ScrollLinkedReveal as="p" className={heroAgeNotice.className} distance={80} html={heroAgeNotice.inner} />
        <a
          className={scrollCue.className}
          href="#sobre"
          aria-label="Rolar para conhecer a Allure"
          dangerouslySetInnerHTML={{ __html: scrollCue.inner }}
        />
      </section>

      <ScrollLinkedReveal as="section" className={about.className} id={about.id} distance={100} html={about.inner} />

      <section className={services.className} id={services.id}>
        <ScrollLinkedReveal
          as="div"
          className={servicesHeading.className}
          distance={100}
          html={servicesHeading.inner}
        />
        <div className={serviceList.className}>
          {serviceItems.map((item, index) => (
            <ScrollLinkedReveal
              as="article"
              className={item.className}
              key={`service-${index}`}
              distance={80}
              html={item.inner}
            />
          ))}
        </div>
        <div className={servicesCta.className} dangerouslySetInnerHTML={{ __html: servicesCta.inner }} />
      </section>

      <ScrollLinkedReveal
        as="section"
        className={processSection.className}
        id={processSection.id}
        distance={100}
        html={processSection.inner}
      />

      <section className={proof.className} id={proof.id}>
        <ScrollLinkedReveal
          as="div"
          className={proofLabel.className}
          distance={80}
          html={proofLabel.inner}
        />
        <div className={ceosWrap.className}>
          <ScrollLinkedReveal
            as="h2"
            className={ceosTitle.className}
            distance={100}
            html={ceosTitle.inner}
          />
          <ScrollLinkedReveal
            as="p"
            className={ceosLead.className}
            distance={80}
            html={ceosLead.inner}
          />
          <div className={ceosGrid.className}>
            {ceoCards.map((card, index) => (
              <ScrollLinkedReveal
                as="article"
                className={card.className}
                key={`ceo-${index}`}
                distance={80}
                html={card.inner}
              />
            ))}
          </div>
        </div>
      </section>

      <ScrollLinkedReveal as="section" className={contact.className} id={contact.id} distance={100} html={contact.inner} />
      <footer className={footer.className} dangerouslySetInnerHTML={{ __html: footer.inner }} />
    </main>
  );
}
