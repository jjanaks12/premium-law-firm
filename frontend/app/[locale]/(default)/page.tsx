import HeroBanner from "./(home)/HeroBanner";
import Recognition from "./(home)/Recognition";
import Info from "./(home)/Info";
import PracticeAreas from "./(home)/PracticeAreas";
import Attorneys from "./(home)/Attorneys";
import Testimonials from "./(home)/Testimonials";
import Insights from "./(home)/Insights";
import Contact from "./(home)/Contact";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <Recognition />
      <Info />
      <PracticeAreas />
      <Attorneys />
      <Testimonials />
      <Insights />
      <Contact />
    </>
  );
}
