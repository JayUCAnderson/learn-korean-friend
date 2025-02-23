
import { HangulLearningContainer } from "@/components/hangul/HangulLearningContainer";
import { Header } from "@/components/Header";

const BasicConsonantsLearning = () => {
  return (
    <div>
      <Header />
      <main className="pt-16 md:pt-20">
        <HangulLearningContainer section="basic_consonants" />
      </main>
    </div>
  );
};

export default BasicConsonantsLearning;
