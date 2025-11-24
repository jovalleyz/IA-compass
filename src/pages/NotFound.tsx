import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl md:text-6xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-lg md:text-xl text-muted-foreground">Oops! Página no encontrada</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
