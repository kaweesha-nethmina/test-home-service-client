import { Badge } from "@/components/ui/badge"

interface ServiceTagsProps {
  tags: string[]
}

export function ServiceTags({ tags }: ServiceTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  )
}