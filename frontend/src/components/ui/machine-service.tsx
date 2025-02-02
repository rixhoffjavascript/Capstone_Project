import * as React from "react"
import { Card, CardContent } from "./card"
import { Settings, Hammer, Wrench } from "lucide-react"

export function MachineService(): React.JSX.Element {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Machine Servicing and Repairs</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Professional maintenance and repair services for all your flooring equipment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="rounded-full bg-primary/10 p-3 mb-4 w-12 h-12 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Maintenance</h3>
              <p className="text-neutral-600">Regular maintenance to keep your equipment running smoothly</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="rounded-full bg-primary/10 p-3 mb-4 w-12 h-12 flex items-center justify-center">
                <Hammer className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Repairs</h3>
              <p className="text-neutral-600">Expert repairs for all types of flooring equipment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="rounded-full bg-primary/10 p-3 mb-4 w-12 h-12 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Parts</h3>
              <p className="text-neutral-600">Genuine parts and accessories for your equipment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
