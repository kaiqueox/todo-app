import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Página não encontrada</p>
      <Link href="/">
        <a className="btn btn-primary">Voltar para a página inicial</a>
      </Link>
    </div>
  );
}