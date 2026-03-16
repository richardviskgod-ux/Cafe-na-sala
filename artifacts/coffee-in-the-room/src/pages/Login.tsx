import { motion } from "framer-motion";
import { CoffeeScene } from "@/components/CoffeeScene";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('/images/coffee-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <CoffeeScene />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Bem-vindo ao
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Coffee in the Room
              </span>
            </h1>
            <p className="text-white/60">Faça login para acessar o sistema</p>
          </div>

          <Button onClick={login} className="w-full h-14 text-lg rounded-xl">
            Entrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
