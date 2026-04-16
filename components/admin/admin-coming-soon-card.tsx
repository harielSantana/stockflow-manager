"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminComingSoonCardProps = {
  title: string
  description: string
  items: string[]
}

export function AdminComingSoonCard({ title, description, items }: AdminComingSoonCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="outline">Roadmap</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border bg-background px-3 py-2 text-sm">
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
