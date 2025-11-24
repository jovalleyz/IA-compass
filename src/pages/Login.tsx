import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, signupSchema, passwordResetRequestSchema } from "@/lib/validation";
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    
    const { error } = await signIn(validation.data.email, validation.data.password);
    
    if (error) {
      toast.error(error.message || "Error al iniciar sesión");
    } else {
      toast.success("Sesión iniciada correctamente");
      navigate("/dashboard");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ nombre, email, password });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(validation.data.email, validation.data.password, validation.data.nombre);
    
    if (error) {
      toast.error(error.message || "Error al registrarse");
    } else {
      toast.success("Cuenta creada exitosamente. Por favor revisa tu email para confirmar.");
      setEmail("");
      setPassword("");
      setNombre("");
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = passwordResetRequestSchema.safeParse({ email: resetEmail });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    
    const { error } = await resetPassword(validation.data.email);
    
    if (error) {
      toast.error(error.message || "Error al enviar email de recuperación");
    } else {
      toast.success("Email de recuperación enviado. Revisa tu bandeja de entrada.");
      setResetEmail("");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Brain className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl md:text-2xl">Bienvenido a OVM IA Framework</CardTitle>
          <CardDescription className="text-sm">
            Accede a tu cuenta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 md:h-10">
              <TabsTrigger value="login" className="text-xs md:text-sm">Ingresar</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs md:text-sm">Registrarse</TabsTrigger>
              <TabsTrigger value="reset" className="text-xs md:text-sm">Recuperar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo Electrónico</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nombre">Nombre Completo</Label>
                  <Input
                    id="signup-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Correo Electrónico</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres, 1 mayúscula y 1 carácter especial
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Correo Electrónico</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
      
      <footer className="border-t bg-card/50 backdrop-blur-sm w-full mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 OVM Consulting - Framework de IA Empresarial. Todos los derechos reservados.
            </p>
            <a href="/terms" className="text-sm text-primary hover:underline">
              Términos y Condiciones
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
