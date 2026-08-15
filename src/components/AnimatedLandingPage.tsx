// Allure Agency motion system: editorial-luxury reveals with a restrained cinematic cadence.
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { allureHtml } from "@/lib/allure-html";

type ElementSlice = {
  tag: string;
  opening: string;
  outer: string;
  inner: string;
  className: string;
  id?: string;
};

const premiumEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: false, amount: 0.2 } as const;

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

function RawSection({ section }: { section: ElementSlice }) {
  return (
    <section className={section.className} id={section.id} dangerouslySetInnerHTML={{ __html: section.inner }} />
  );
}

function AnimatedSection({ section }: { section: ElementSlice }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className={section.className}
      id={section.id}
      initial={reduceMotion ? false : { opacity: 0, y: 90 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 1.3, ease: premiumEase }}
      dangerouslySetInnerHTML={{ __html: section.inner }}
    />
  );
}

export function AnimatedLandingPage() {
  const reduceMotion = useReducedMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 90 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.3, ease: premiumEase } },
  };
  const serviceContainer: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: 0.16, staggerChildren: 0.48 } },
  };
  const serviceItem: Variants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.25, ease: premiumEase } },
  };
  const ceoContainer: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: 0.18, staggerChildren: 0.3 } },
  };
  const ceoCard: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.3, ease: premiumEase } },
  };

  const initialLoad = reduceMotion ? false : { opacity: 0, y: -80 };
  const initialHeroTitle = reduceMotion ? false : { opacity: 0, y: 100 };
  const initialAgeNotice = reduceMotion ? false : { opacity: 0, y: 80 };

  return (
    <main className="allure-page">
      <section className={hero.className} id={hero.id}>
        <div className={heroPhoto.className} aria-hidden="true" />
        <div className={heroShade.className} aria-hidden="true" />
        <motion.nav
          className={heroNav.className}
          aria-label="Navegação principal"
          initial={initialLoad}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.25, ease: premiumEase }}
          dangerouslySetInnerHTML={{ __html: heroNav.inner }}
        />
        <div className={heroContent.className}>
          <Html content={heroBeforeTitle} />
          <motion.h1
            initial={initialHeroTitle}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.16, ease: premiumEase }}
            dangerouslySetInnerHTML={{ __html: heroTitle.inner }}
          />
          <Html content={heroAfterTitle} />
        </div>
        <p className={heroAgeNotice.className}>
          <motion.span
            initial={initialAgeNotice}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.25, delay: 0.5, ease: premiumEase }}
            dangerouslySetInnerHTML={{ __html: heroAgeNotice.inner }}
          />
        </p>
        <a
          className={scrollCue.className}
          href="#sobre"
          aria-label="Rolar para conhecer a Allure"
          dangerouslySetInnerHTML={{ __html: scrollCue.inner }}
        />
      </section>

      <AnimatedSection section={about} />

      <motion.section className={services.className} id={services.id}>
        <motion.div
          className={servicesHeading.className}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          dangerouslySetInnerHTML={{ __html: servicesHeading.inner }}
        />
        <motion.div
          className={serviceList.className}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewport}
          variants={serviceContainer}
        >
          {serviceItems.map((item, index) => (
            <motion.article
              className={item.className}
              key={`service-${index}`}
              variants={serviceItem}
              dangerouslySetInnerHTML={{ __html: item.inner }}
            />
          ))}
        </motion.div>
        <div className={servicesCta.className} dangerouslySetInnerHTML={{ __html: servicesCta.inner }} />
      </motion.section>

      <AnimatedSection section={processSection} />

      <motion.section className={proof.className} id={proof.id}>
        <motion.div
          className={proofLabel.className}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          dangerouslySetInnerHTML={{ __html: proofLabel.inner }}
        />
        <div className={ceosWrap.className}>
          <motion.h2
            className={ceosTitle.className}
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            dangerouslySetInnerHTML={{ __html: ceosTitle.inner }}
          />
          <motion.p
            className={ceosLead.className}
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            transition={{ duration: 1.3, delay: 0.16, ease: premiumEase }}
            dangerouslySetInnerHTML={{ __html: ceosLead.inner }}
          />
          <motion.div
            className={ceosGrid.className}
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewport}
            variants={ceoContainer}
          >
            {ceoCards.map((card, index) => (
              <motion.article
                className={card.className}
                key={`ceo-${index}`}
                variants={ceoCard}
                dangerouslySetInnerHTML={{ __html: card.inner }}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <AnimatedSection section={contact} />
      <footer className={footer.className} dangerouslySetInnerHTML={{ __html: footer.inner }} />
    </main>
  );
}
