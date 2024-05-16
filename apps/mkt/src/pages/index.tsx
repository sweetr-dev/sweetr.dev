import { Faq } from "../components/faq";
import { Footer } from "../components/footer";
import { Hero } from "../components/hero";
import { Nav } from "../components/nav";
import { Products } from "../components/products";

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ paddingBottom: 120 }}>
        <Hero />
        <Products />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
