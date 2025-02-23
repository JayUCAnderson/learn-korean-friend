
import { HangulLearningContainer } from "@/components/hangul/HangulLearningContainer";
import { Header } from "@/components/Header";

const AdvancedConsonantsLearning = () => {
  return (
    <div>
      <Header />
      <main className="pt-16 md:pt-20">
        <HangulLearningContainer section="advanced_consonants" />
      </main>
    </div>
  );
};

export default AdvancedConsonantsLearning;
