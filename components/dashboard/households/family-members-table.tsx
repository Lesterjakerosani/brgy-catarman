"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { UsersRound } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { useResidentsStore } from "@/lib/stores/residents-store"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { getRelationshipToHead } from "@/lib/relationship"
import type { Household, Resident } from "@/types"

export function FamilyMembersTable({ household }: { household: Household }) {
  const residents = useResidentsStore((s) => s.residents)

  const members = React.useMemo(() => {
    const residentMap = new Map(residents.map((r) => [r.id, r]))
    return household.memberIds.map((id) => residentMap.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r))
  }, [residents, household.memberIds])

  const head: Resident | undefined = residents.find((r) => r.id === household.headResidentId)

  if (members.length === 0) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No family members on record"
        description="This household has no linked residents yet."
        className="m-3 border-none bg-transparent py-8"
      />
    )
  }

  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#64748B]">
        <UsersRound className="size-3.5 text-[#64748B]" />
        Family Members ({members.length})
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="w-10 text-[#64748B]"></TableHead>
              <TableHead className="text-[#64748B]">Full Name</TableHead>
              <TableHead className="text-[#64748B]">Relationship to Head</TableHead>
              <TableHead className="text-[#64748B]">Age</TableHead>
              <TableHead className="text-[#64748B]">Gender</TableHead>
              <TableHead className="text-[#64748B]">Civil Status</TableHead>
              <TableHead className="text-[#64748B]">Community Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, idx) => {
              const fullName = getResidentFullName(member)
              const isHead = member.id === household.headResidentId
              const relationship = isHead
                ? "Head"
                : member.relationshipToHead ?? (head ? getRelationshipToHead(member, head) : "Relative")

              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.02, ease: "easeOut" }}
                  className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F1F5F9]"
                >
                  <TableCell>
                    <InitialsAvatar name={fullName} photoUrl={member.photoUrl} size="sm" />
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-[#0F172A]">{fullName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        relationship === "Head"
                          ? "border-[#1E40AF]/30 bg-[#EFF6FF] font-medium text-[#1E40AF]"
                          : "border-[#E2E8F0] font-normal text-[#334155]"
                      }
                    >
                      {relationship}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#334155]">{getResidentAge(member.birthdate)}</TableCell>
                  <TableCell className="text-sm text-[#334155]">{member.gender}</TableCell>
                  <TableCell className="text-sm text-[#334155]">{member.civilStatus}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.tags.length === 0 ? (
                        <span className="text-xs text-[#94A3B8]">—</span>
                      ) : (
                        member.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#334155]">
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
