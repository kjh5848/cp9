"use client";

import { useAdminMonitoringViewModel } from "../model/useAdminMonitoringViewModel";
import { QueueListTable } from "@/entities/queue/ui/QueueListTable";

export function QueueMonitorWidget() {
  const { queues, isLoading } = useAdminMonitoringViewModel();

  return (
    <QueueListTable 
      queues={queues} 
      isLoading={isLoading} 
    />
  );
}
