import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingEditAgent() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/studio">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">返回</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">编辑 Agent</h1>
            <p className="text-muted-foreground">更新Agent的配置和设置</p>
          </div>
        </div>
        <Button disabled>保存</Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
} 