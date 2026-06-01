import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 className="app-title">DESAFIO-26</h1>
        <p className="app-subtitle">
          App provisional para planes familiares en Euskadi
        </p>
      </header>

      <div className="app-content">
        <AppRoutes />
      </div>

      <footer className="app-footer">
        <small>Bootstrap inicial · nombre de la app provisional</small>
      </footer>
    </main>
  );
}

export default App;
