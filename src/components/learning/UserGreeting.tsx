
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserGreetingProps {
  level: string;
}

export const UserGreeting = ({ level }: UserGreetingProps) => {
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요!";
    if (hour < 18) return "안녕하세요!";
    return "좋은 저녁이에요!";
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getPersonalizedGreeting()}</h1>
          <p className="text-gray-500">Your personal Korean tutor is here to help!</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Current Level</p>
        <p className="text-lg font-semibold text-korean-600">
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </p>
      </div>
    </div>
  );
};
