import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"
import { Hammer, Ruler, Paintbrush, Settings, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const iconMap = {
  installation: Hammer,
  measurement: Ruler,
  finishing: Paintbrush,
  repair: Settings,
} as const

interface ServiceCardProps {
  name: string;
  description: string;
  base_price: number;
  type?: keyof typeof iconMap;
}

export function ServiceCard({ name, description, base_price, type = "installation" }: ServiceCardProps): React.JSX.Element {
  const Icon = iconMap[type]
  
  return (
    <Card className="group transition-all hover:shadow-lg border border-neutral-200 hover:border-primary/20">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="rounded-full bg-primary/10 p-2 sm:p-3 group-hover:bg-primary/20 transition-colors duration-200">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors duration-200">{name}</CardTitle>
            <CardDescription className="mt-1 sm:mt-1.5 text-sm sm:text-base font-medium">
              Starting from <span className="text-primary">${base_price}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <p className="text-sm sm:text-base text-neutral-600">{description}</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/request-quote"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-white hover:bg-primary-dark transition-colors rounded-md font-medium"
          >
            Request Quote
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            to={`/services/${name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-primary text-primary hover:bg-primary/5 transition-colors rounded-md font-medium"
          >
            Learn More
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
