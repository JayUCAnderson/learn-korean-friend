
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const LearningInterface = ({ userData }: { userData: any }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">안녕하세요!</h1>
            <p className="text-gray-500">Welcome to your Korean journey</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Level</p>
            <p className="text-lg font-semibold text-korean-600">
              {userData.level.charAt(0).toUpperCase() + userData.level.slice(1)}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
          <Progress value={33} className="mb-2" />
          <p className="text-sm text-gray-500">1 of 3 lessons completed</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-korean-100">
            <h3 className="text-lg font-semibold mb-2">Basic Greetings</h3>
            <p className="text-gray-500 mb-4">Learn essential Korean greetings</p>
            <Button className="w-full bg-korean-600 hover:bg-korean-700">
              Start Lesson
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Numbers 1-10</h3>
            <p className="text-gray-500 mb-4">Master Korean number system</p>
            <Button className="w-full" variant="outline">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Basic Particles</h3>
            <p className="text-gray-500 mb-4">Understanding Korean particles</p>
            <Button className="w-full" variant="outline">
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
