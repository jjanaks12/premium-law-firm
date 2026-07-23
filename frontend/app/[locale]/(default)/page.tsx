import { useTranslations } from "next-intl";
import HeroBanner from "./(home)/HeroBanner";
import Info from "./(home)/Info";
import Recognition from "./(home)/Recognition";
import PracticeAreas from "./(home)/PracticeAreas";
import Attorneys from "./(home)/Attorneys";
import Testimonials from "./(home)/Testimonials";
import Insights from "./(home)/Insights";
import Contact from "./(home)/Contact";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <>
      <HeroBanner />
      <Info />
      <Recognition />
      <PracticeAreas />
      <Attorneys />
      <Testimonials />
      <Insights />
      <Contact />
    </>
  );
}
