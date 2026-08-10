import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const AUTH_KEY = 'painel-authenticated';
const LINKS_KEY = 'painel-links';
const DEFAULT_PASSWORD = 'painel123';

const initialLinks = [
  { id: crypto.randomUUID(), title: 'Google', url: 'https://www.google.com' },
  { id: crypto.randomUUID(), title: 'GitHub', url: 'https://github.com' },
  { id: crypto.randomUUID(), title: 'OpenAI', url: 'https://openai.com' },
];

function readSavedLinks() {
  try {
    const savedLinks = localStorage.getItem(LINKS_KEY);
    return savedLinks ? JSON.parse(savedLinks) : initialLinks;
  } catch {
    return initialLinks;
  }
}

function normalizeUrl(url) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (password === DEFAULT_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      onLogin();
      return;
    }

    setError('Senha inválida. Tente novamente.');
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">Painel privado</p>
        <h1 id="auth-title">Acesse seu painel de links</h1>
        <p className="muted">
          Use uma autenticação simples para proteger a página neste primeiro momento.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite a senha"
            autoComplete="current-password"
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Entrar</button>
        </form>

        <p className="hint">Senha padrão: {DEFAULT_PASSWORD}</p>
      </section>
    </main>
  );
}

function Dashboard({ onLogout }) {
  const [links, setLinks] = useState(readSavedLinks);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState('');

  const sortedLinks = useMemo(
    () => [...links].sort((current, next) => current.title.localeCompare(next.title)),
    [links],
  );

  function saveLinks(nextLinks) {
    setLinks(nextLinks);
    localStorage.setItem(LINKS_KEY, JSON.stringify(nextLinks));
  }

  function handleAddLink(event) {
    event.preventDefault();
    const normalizedUrl = normalizeUrl(url);
    const trimmedTitle = title.trim();

    if (!trimmedTitle || !normalizedUrl) {
      setFeedback('Informe um nome e uma URL para adicionar o botão.');
      return;
    }

    const nextLinks = [
      ...links,
      { id: crypto.randomUUID(), title: trimmedTitle, url: normalizedUrl },
    ];

    saveLinks(nextLinks);
    setTitle('');
    setUrl('');
    setFeedback('Link adicionado com sucesso.');
  }

  function handleRemoveLink(id) {
    saveLinks(links.filter((link) => link.id !== id));
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    onLogout();
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Central de acesso</p>
          <h1>Painel de links</h1>
          <p className="muted">Salve seus endereços frequentes e abra tudo em novas abas.</p>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <section className="panel" aria-labelledby="add-link-title">
        <div>
          <p className="eyebrow">Novo atalho</p>
          <h2 id="add-link-title">Adicionar endereço</h2>
        </div>

        <form className="link-form" onSubmit={handleAddLink}>
          <label>
            Nome do botão
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Sistema interno"
            />
          </label>
          <label>
            URL
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Ex.: https://exemplo.com"
            />
          </label>
          <button type="submit">Adicionar</button>
        </form>
        {feedback && <p className="feedback">{feedback}</p>}
      </section>

      <section className="panel" aria-labelledby="links-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Atalhos salvos</p>
            <h2 id="links-title">Seus botões</h2>
          </div>
          <span>{links.length} links</span>
        </div>

        {sortedLinks.length > 0 ? (
          <div className="links-grid">
            {sortedLinks.map((link) => (
              <article className="link-card" key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.title}
                </a>
                <p>{link.url}</p>
                <button type="button" onClick={() => handleRemoveLink(link.id)}>
                  Remover
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Nenhum link adicionado ainda.</p>
        )}
      </section>
    </main>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === 'true',
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
