import * as React from "react"
import { Card, CardContent } from "./card"
import { Home, Building2, Wrench, Palette, Shield, Truck } from "lucide-react"

const departments = [
  {
    name: "Residential Installation",
    description: "Expert installation for homes and apartments",
    icon: Home
  },
  {
    name: "Commercial Services",
    description: "Specialized solutions for business spaces",
    icon: Building2
  },
  {
    name: "Maintenance",
    description: "Regular upkeep and maintenance services",
    icon: Wrench
  },
  {
    name: "Custom Design",
    description: "Personalized flooring design services",
    icon: Palette
  },
  {
    name: "Emergency Repairs",
    description: "24/7 emergency repair services",
    icon: Shield
  },
  {
    name: "Material Supply",
    description: "Quality materials and supplies",
    icon: Truck
  }
]

export function ServiceDepartments(): React.JSX.Element {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">Our Departments</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Comprehensive flooring services for all your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4 w-12 h-12 flex items-center justify-center">
                  {React.createElement(dept.icon, {
                    className: "h-6 w-6 text-primary"
                  })}
                </div>
                <h3 className="font-semibold text-xl text-secondary mb-3">{dept.name}</h3>
                <p className="text-neutral-600">{dept.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
