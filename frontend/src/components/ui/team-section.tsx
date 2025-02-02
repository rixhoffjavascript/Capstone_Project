import * as React from "react"
import { Card, CardContent } from "./card"
import { Users } from "lucide-react"

export function TeamSection(): React.JSX.Element {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">Our Expert Team</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Meet our experienced professionals dedicated to providing top-quality flooring solutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-secondary mb-2">Installation Team</h3>
              <p className="text-neutral-600">Expert installers with years of experience in all types of flooring</p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-secondary mb-2">Design Consultants</h3>
              <p className="text-neutral-600">Professional designers to help you choose the perfect flooring solution</p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-xl text-secondary mb-2">Service Technicians</h3>
              <p className="text-neutral-600">Skilled technicians for maintenance and repair of all equipment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
