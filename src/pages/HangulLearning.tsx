
import { HangulLearningContainer } from "@/components/hangul/HangulLearningContainer";
import { Header } from "@/components/Header";

const HangulLearning = () => {
  return (
    <div>
      <Header />
      <main className="pt-16 md:pt-20">
        <HangulLearningContainer />
      </main>
    </div>
  );
};

export default HangulLearning;
