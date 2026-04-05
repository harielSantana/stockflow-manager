"use client"

import { Header } from "@/components/dashboard/header"
import { CostForm } from "@/components/financeiro/cost-form"

export default function CustosPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Custos Fixos"
        description="Gerencie os custos fixos mensais do negocio"
      />
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <CostForm />
      </div>
    </div>
  )
}
