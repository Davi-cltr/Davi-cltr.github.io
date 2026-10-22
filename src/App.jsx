import { useLanguage } from './i18n/LanguageProvider.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Experience from './components/Experience.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const { t } = useLanguage()
  return (
    <>
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
