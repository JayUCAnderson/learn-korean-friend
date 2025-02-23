
import { HangulLearningContainer } from "@/components/hangul/HangulLearningContainer";
import { Header } from "@/components/Header";

const VowelsLearning = () => {
  return (
    <div>
      <Header />
      <main className="pt-16 md:pt-20">
        <HangulLearningContainer section="vowels" />
      </main>
    </div>
  );
};

export default VowelsLearning;
