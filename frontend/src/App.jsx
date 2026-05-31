// Pantalla inicial mínima del bootstrap.
// Enlaces placeholder: aún NO hay routing real ni pantallas implementadas.

const PLACEHOLDER_LINKS = [
  { label: 'Landing', href: '#landing' },
  { label: 'Login', href: '#login' },
  { label: 'Buscar planes', href: '#buscar-planes' },
  { label: 'Panel negocio', href: '#panel-negocio' },
  { label: 'Panel admin', href: '#panel-admin' },
];

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 className="app-title">DESAFIO-26</h1>
        <p className="app-subtitle">
          App provisional para planes familiares en Euskadi
        </p>
      </header>

      <nav className="placeholder-nav" aria-label="Navegación provisional">
        <ul className="placeholder-nav__list">
          {PLACEHOLDER_LINKS.map((link) => (
            <li key={link.label} className="placeholder-nav__item">
              <a className="placeholder-nav__link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="app-footer">
        <small>Bootstrap inicial · nombre de la app provisional</small>
      </footer>
    </main>
  );
}

export default App;
