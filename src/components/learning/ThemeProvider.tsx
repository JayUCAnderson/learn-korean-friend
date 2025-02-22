
interface ThemeColors {
  gradient: string;
  accent: string;
  border: string;
  button: string;
}

export const getThemeColors = (interest: string = ''): ThemeColors => {
  if (interest.includes("kpop") || interest.includes("music")) {
    return {
      gradient: "from-pink-100 to-purple-100",
      accent: "bg-korean-500",
      border: "border-pink-200",
      button: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
    };
  }
  if (interest.includes("drama") || interest.includes("movie")) {
    return {
      gradient: "from-blue-50 to-indigo-100",
      accent: "bg-korean-600",
      border: "border-blue-200",
      button: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
    };
  }
  if (interest.includes("food")) {
    return {
      gradient: "from-orange-50 to-red-100",
      accent: "bg-korean-500",
      border: "border-orange-200",
      button: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
    };
  }
  if (interest.includes("tech")) {
    return {
      gradient: "from-cyan-50 to-blue-100",
      accent: "bg-korean-600",
      border: "border-cyan-200",
      button: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
    };
  }
  return {
    gradient: "from-white to-gray-50",
    accent: "bg-korean-600",
    border: "border-korean-100",
    button: "bg-korean-600 hover:bg-korean-700",
  };
};
