import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../lib/api';

export function useHistory() {
  return useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
  });
}
