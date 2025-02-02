import * as React from "react"
import { Button } from "./button"
import { Tractor, ArrowRight } from "lucide-react"
import { TractorIllustration } from "./tractor-illustration"

export function Hero(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden bg-neutral-50">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
          <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
                <span className="block">Professional Flooring</span>{' '}
                <span className="block text-primary">Installation Services</span>
              </h1>
              <p className="mt-3 text-base text-neutral-600 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                Transform your space with our expert flooring solutions. From hardwood to ceramic, we provide top-quality materials and professional installation services.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Button
                    size="lg"
                    className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary-dark"
                    onClick={() => window.location.href = '/request-quote'}
                  >
                    Request Quote
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={() => window.location.href = '/manage-services'}
                  >
                    View Services
                    <Tractor className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full sm:h-72 md:h-96 lg:h-full relative overflow-hidden">
          <TractorIllustration />
        </div>
      </div>
    </div>
  )
}
