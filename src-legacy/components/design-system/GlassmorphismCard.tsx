import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function GlassmorphismCard() {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center rounded-3xl overflow-hidden bg-slate-50 dark:bg-background border border-border">
      {/* Background Vibrants Simulation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute top-[0%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/40 blur-[80px]" />
        <div className="absolute bottom-[0%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/30 blur-[80px]" />
      </div>
      
      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-card/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-2xl mb-6 shadow-inner border border-primary/30">
          <Sparkles className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Glassmorphism
        </h2>
        <p className="text-muted-foreground mb-8">
          Ceci est la carte de démonstration. L'opacité du fond à 60% avec un énorme 'backdrop-blur-2xl' permet aux orbes lumineuses de traverser la fenêtre.
        </p>
        <Button className="w-full text-lg rounded-xl shadow-button hover:shadow-primary/25 transition-all">
          Ça déchire !
        </Button>
      </div>
    </div>
  )
}
