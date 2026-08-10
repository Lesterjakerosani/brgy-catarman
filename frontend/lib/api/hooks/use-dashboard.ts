import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"

interface PublicStats {
  residents: number
  households: number
  puroks: number
  certificatesProcessed: number
  incidentsResolved: number
}

export function usePublicStats() {
  const { data, isLoading } = useQuery<PublicStats>({
    queryKey: [...qk.dashboard.stats, "public"],
    queryFn: () => dashboardApi.statsPublic() as Promise<PublicStats>,
  })
  return { stats: data, isLoading }
}
