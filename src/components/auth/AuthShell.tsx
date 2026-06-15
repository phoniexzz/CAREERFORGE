import { GraduationCap, ShieldCheck } from "lucide-react";
import { type ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-[calc(100vh-64px)] bg-[#f4f7f8] lg:grid-cols-[0.8fr_1.2fr]">
      <section className="hidden bg-[#17364b] px-12 py-14 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Career Co-Pilot</p>
            <p className="text-xs text-[#b9cbd4]">Private careers workspace</p>
          </div>
        </div>
        <div className="my-auto max-w-lg">
          <p className="text-xs font-bold uppercase text-[#9fd4d0]">
            Verified base CV
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Your career evidence, kept consistent
          </h1>
          <p className="mt-5 text-base leading-7 text-[#d7e3e9]">
            Save structured experience, review AI suggestions before accepting
            them, and preserve a reliable foundation for future applications.
          </p>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-[#b9cbd4]">
          <ShieldCheck className="size-4 text-[#9fd4d0]" />
          Uploaded originals remain on your device.
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <p className="page-kicker">CareerForge account</p>
          <h1 className="page-title mt-2">{title}</h1>
          <p className="page-description mt-2">{description}</p>
          <div className="surface-panel mt-7 p-5 sm:p-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
