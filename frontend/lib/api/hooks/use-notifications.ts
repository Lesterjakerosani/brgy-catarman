import { useQuery } from "@tanstack/react-query"
import { notificationsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { fromNotificationDto } from "@/lib/api/adapters/log.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { AppNotification } from "@/types"

type NotificationsResult = PaginatedResult<unknown> & { unreadCount: number }

export function useNotifications(params?: { page?: number; pageSize?: number }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 50 }
  const { data, isLoading } = useQuery<NotificationsResult>({
    queryKey: [...qk.notifications.all, queryParams],
    queryFn: () => notificationsApi.list(queryParams) as Promise<NotificationsResult>,
  })
  const notifications: AppNotification[] = (data?.items ?? []).map((n) => fromNotificationDto(n as never))
  return { notifications, unreadCount: data?.unreadCount ?? 0, isLoading }
}

export function useMarkNotificationRead() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => notificationsApi.markRead(id),
    invalidates: [qk.notifications.all],
    showErrorToast: false,
  })
}

export function useMarkAllNotificationsRead() {
  return useApiMutation<unknown, void>({
    mutationFn: () => notificationsApi.markAllRead(),
    invalidates: [qk.notifications.all],
    showErrorToast: false,
  })
}
