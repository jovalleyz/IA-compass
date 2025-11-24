import { Link } from "react-router-dom";
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 OVM Consulting - Framework de IA Empresarial. Todos los derechos reservados.
          </p>
          <Link 
            to="/terms" 
            className="text-sm text-primary hover:underline"
          >
            Términos y Condiciones
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
