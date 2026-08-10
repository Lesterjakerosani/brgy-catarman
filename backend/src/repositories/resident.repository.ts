import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";

export interface ResidentListFilters {
  search?: string;
  purokId?: string;
  householdId?: string;
  tagType?: string;
  skip: number;
  take: number;
}

function buildWhere(filters: ResidentListFilters): Prisma.ResidentWhereInput {
  return {
    deletedAt: null,
    purokId: filters.purokId,
    householdId: filters.householdId,
    ...(filters.tagType ? { tags: { some: { tagType: filters.tagType as never, isActive: true } } } : {}),
    ...(filters.search
      ? {
          OR: [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { contactNumber: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

const includeRelations = {
  purok: { include: { sitio: true } },
  household: true,
  tags: true,
} satisfies Prisma.ResidentInclude;

export const residentRepository = {
  async list(filters: ResidentListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        include: includeRelations,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.resident.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.resident.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  create(data: Prisma.ResidentUncheckedCreateInput) {
    return prisma.resident.create({ data, include: includeRelations });
  },

  update(id: string, data: Prisma.ResidentUncheckedUpdateInput) {
    return prisma.resident.update({ where: { id }, data, include: includeRelations });
  },

  softDelete(id: string) {
    return prisma.resident.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },

  count() {
    return prisma.resident.count({ where: { deletedAt: null } });
  },

  async replaceTags(
    residentId: string,
    tags: { tagType: string; remarks?: string; effectiveDate?: Date; expiryDate?: Date }[],
    createdById: string | null,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.residentTag.deleteMany({ where: { residentId } });
      if (tags.length > 0) {
        await tx.residentTag.createMany({
          data: tags.map((tag) => ({
            residentId,
            tagType: tag.tagType as never,
            remarks: tag.remarks,
            effectiveDate: tag.effectiveDate,
            expiryDate: tag.expiryDate,
            createdById,
          })),
        });
      }
      return tx.resident.findUniqueOrThrow({ where: { id: residentId }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },
};
