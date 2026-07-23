import Footer from "./footer";
import Header from "./header";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
}
