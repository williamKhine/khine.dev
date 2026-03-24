import Noise from "@/components/Noise"

export default function NotFound() {
  return (
    <main className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden bg-background font-sans text-foreground">
      <style>{`body { overflow: hidden; }`}</style>
      <div className="absolute inset-0 z-0">
        <Noise
          patternSize={250}
          patternScaleX={2}
          patternScaleY={2}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
      </div>
      <div className="z-10 flex items-center">
        <h1 className="mr-5 border-r border-foreground/30 pr-6 text-2xl font-medium leading-[49px]">
          404
        </h1>
        <h2 className="text-sm font-normal leading-[49px]">
          This page could not be found.
        </h2>
      </div>
    </main>
  )
}