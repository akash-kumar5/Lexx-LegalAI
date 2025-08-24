import AboutProjectSection from "./MainPageCom/AboutProject";
import FAQSection from "./MainPageCom/FAQSection";
import FeaturesSection from "./MainPageCom/FeaturesGrid";
import HeroSection from "./MainPageCom/HeroSection";
import PreviewSection from "./MainPageCom/Preview";
import ProblemSolutionSection from "./MainPageCom/ProblemSolution";
import TechBar from "./MainPageCom/TechBar";
import WorkflowSection from "./MainPageCom/WorkflowSection";
import Footer from "./components/Footer";


export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProblemSolutionSection />
      <TechBar />
      <WorkflowSection />
      <FeaturesSection />
      <PreviewSection />
      <AboutProjectSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
