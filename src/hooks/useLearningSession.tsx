
import { useContentFetching } from './useContentFetching';
import { useSessionRecording } from './useSessionRecording';
import type { ContentType, KoreanLevel } from '@/types/learning';

export const useLearningSession = () => {
  const { fetchContent, isLoading } = useContentFetching();
  const { recordSession } = useSessionRecording();

  return {
    startSession: fetchContent,
    recordSession,
    isLoading,
  };
};
