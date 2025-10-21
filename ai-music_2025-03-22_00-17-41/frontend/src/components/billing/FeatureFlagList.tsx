import { db } from "@/lib/db"
import { DataTable } from "@/components/ui/DataTable"
import { columns } from ./feature-flag-columns"

export async function FeatureFlagList() {
  const featureFlags = await db.featureFlag.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <DataTable
      columns={columns}
      data={featureFlags}
      searchKey="name"
    />
  )
}

