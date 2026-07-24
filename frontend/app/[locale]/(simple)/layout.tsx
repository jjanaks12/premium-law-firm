import Language from "@/components/Language";

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main">
      {children}
      <Language className="absolute top-4 right-4" />
    </main>
  );
}
