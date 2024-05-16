import { Footer } from "../components/footer";
import { Hero } from "../components/hero";
import { Products } from "../components/products";

export default function Home() {
  return (
    <>
      <object
        data="/privacy-policy.pdf"
        type="application/pdf"
        width="100%"
        style={{ height: "100vh" }}
      >
        <p>
          Unable to display PDF file. <a href="/privacy-policy.pdf">Download</a>{" "}
          instead.
        </p>
      </object>
    </>
  );
}
