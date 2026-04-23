import { useAutopilotViewModel } from '@/features/autopilot/model/useAutopilotViewModel';
import { useAutopilotDashboardState } from './useAutopilotDashboardState';
import { useAutopilotDashboardActions } from './useAutopilotDashboardActions';

export function useAutopilotDashboardViewModel() {
  const autopilotHook = useAutopilotViewModel();
  const state = useAutopilotDashboardState();
  const actions = useAutopilotDashboardActions(state, autopilotHook);

  return {
    ...state,
    ...actions,
    queueError: autopilotHook.error,
    triggerCronManually: autopilotHook.triggerCronManually,
    triggerCampaignCronManually: autopilotHook.triggerCampaignCronManually,
    isQueueLoading: autopilotHook.isLoading,
    queue: autopilotHook.queue,
    fetchQueue: autopilotHook.fetchQueue
  };
}
