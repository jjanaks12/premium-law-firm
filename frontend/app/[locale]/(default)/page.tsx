import HeroBanner from "./(home)/HeroBanner";
import Recognition from "./(home)/Recognition";
import Attorneys from "./(home)/Attorneys";
import Testimonials from "./(home)/Testimonials";
import Insights from "./(home)/Insights";
import Contact from "./(home)/Contact";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <Recognition />
      <Attorneys />
      <Testimonials />
      <Insights />
      <Contact />
    </>
  );
}
