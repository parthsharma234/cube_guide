import CubeEditor from "@/components/CubeEditor";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-1">
          CubeGuide
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
          Enter the colors on your cube, one face at a time. Later, CubeGuide
          will use this to generate a step-by-step solve.
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>How to use:</strong> Pick a color from the palette, then click
        the stickers on each face to paint them. The center sticker of each face
        is locked — it defines that face&apos;s color.
      </div>

      {/* Main editor */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <CubeEditor />
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-zinc-400">
        CubeGuide v0.1 — solver coming soon
      </footer>
    </main>
  );
}
