import FaultyTerminal from './FaultyTerminal';
import { Button } from './ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section id="hero" className="">
      <div className="h-[calc(100dvh-61px)] flex items-center justify-center">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.5}
          pause={false}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.1}
          tint="#006045"
          mouseReact
          mouseStrength={0.5}
          pageLoadAnimation
          brightness={0.6}
          className="[mask-image:linear-gradient(to_bottom,black_80%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
        />
        <div className="absolute text-center container mx-auto space-x-4 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">William Khine</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Full Stack Engineer in Toronto, Canada. All about building performant, scalable, and user-friendly web applications.
          </p>
          <Button variant={'secondary'} asChild>
            <Link href="#projects">View my work</Link>
          </Button>
          <Button asChild>
            <Link href="#contact">Get in touch</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
