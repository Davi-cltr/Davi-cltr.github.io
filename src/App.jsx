import { useEffect, useState } from 'react'
import { useLanguage } from './i18n/LanguageProvider.jsx'
import { iniciarRolagem, ScrollTrigger } from './core/motion.js'
import { useEstado } from './core/useEstado.js'
import Palco from './components/Palco.jsx'
import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import Header from './components/Header.jsx'
import Indice from './components/Indice.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Journey from './components/Journey.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const { t, lang } = useLanguage()
  const reduzido = useEstado((s) => s.reduzido)
  const [glFalhou, setGlFalhou] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('reduzido', reduzido)
    return iniciarRolagem()
  }, [reduzido])

  // textos mudam de tamanho com o idioma: as cenas presas à rolagem precisam se remedir
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  return (
    <>
      <a className="skip-link" href="#conteudo">
        {t('skip')}
      </a>
      {!glFalhou && <Palco aoFalhar={() => setGlFalhou(true)} />}
      <Preloader />
      <Cursor />
      <Header />
      <Indice />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <div className="grao" aria-hidden="true" />
    </>
  )
}
