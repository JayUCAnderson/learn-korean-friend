
export type VoiceOption = {
  id: string;
  name: string;
  gender: 'male' | 'female';
};

export const VOICE_OPTIONS: VoiceOption[] = [
  // Female voices
  { id: 'z6Kj0hecH20CdetSElRT', name: 'Jennie', gender: 'female' },
  { id: 'AW5wrnG1jVizOYY7R1Oo', name: 'JiYoung', gender: 'female' },
  { id: 'uyVNoMrnUku1dZyVEXwD', name: 'Anna', gender: 'female' },
  
  // Male voices
  { id: 'nbrxrAz3eYm9NgojrmFK', name: 'Min-Joon', gender: 'male' },
  { id: '4JJwo477JUAx3HV0T7n7', name: 'Yohan', gender: 'male' },
  { id: '3MTvEr8xCMCC2mL9ujrI', name: 'June', gender: 'male' }
];
