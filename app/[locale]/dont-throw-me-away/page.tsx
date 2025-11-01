import Image from 'next/image';

export default function DontThrowMeAwayPage() {
    return (
      <div className="mx-auto max-w-4xl p-4 py-12 sm:p-6 lg:p-8">
        {/* Hero Section */}
        <div className="rounded-lg border border-border bg-background p-8 shadow-sm mb-8">
          <h1 className="mb-6 text-center text-4xl sm:text-5xl font-bold text-foreground">
            Don&apos;t Throw Me Away
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            Every lighter you save is a small victory against waste and a step toward a sustainable future.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">650M</p>
            <p className="text-sm text-foreground">Disposable lighters sold yearly worldwide</p>
            <p className="text-xs text-muted-foreground mt-2">Source: Market research estimates</p>
          </div>
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">150+</p>
            <p className="text-sm text-foreground">Years to decompose in landfills</p>
            <p className="text-xs text-muted-foreground mt-2">Plastic &amp; metal components</p>
          </div>
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">1 Million</p>
            <p className="text-sm text-foreground">Tons of lighter waste annually</p>
            <p className="text-xs text-muted-foreground mt-2">Environmental burden estimate</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Problem Section */}
          <div className="rounded-lg border border-border bg-background/95 p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-4">The Problem</h2>
                <p className="text-foreground mb-4">
                  Disposable lighters represent a significant environmental challenge. With over 650 million units sold annually worldwide, the vast majority end up in landfills after just a few uses. These devices contain multiple materials—plastic, metal, and butane residue—that persist in the environment for over 150 years.
                </p>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>Plastic components break down into microplastics, contaminating soil and water</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>Metal parts corrode, leaching heavy metals into groundwater</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>Butane residue contributes to greenhouse gas emissions</span>
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-48 flex-shrink-0">
                <Image
                  src="/illustrations/telling_stories.png"
                  alt="Environmental impact illustration"
                  width={192}
                  height={192}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div className="rounded-lg border border-border bg-background/95 p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">The Solution: Refillable Lighters</h2>
            <p className="text-foreground mb-6">
              Refillable lighters are engineered to last for years, making them economical and environmentally responsible. By choosing refillable alternatives, you reduce waste by up to 90% compared to disposables.
            </p>

            <div className="space-y-6">
              <div className="rounded-lg border border-border/50 p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">⛽ Refillable Butane Lighters</h3>
                <p className="text-foreground text-sm mb-3">
                  The most versatile option. These lighters use standard butane cartridges available at most convenience stores and online retailers.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Refill Cost:</strong> €0.50-2.00 per cartridge</p>
                  <p><strong>Lighter Lifespan:</strong> 5-10+ years with proper care</p>
                  <p><strong>Maintenance:</strong> Simple—just insert a butane cartridge into the refill valve</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">🔧 Wick-Based Refillable Lighters</h3>
                <p className="text-foreground text-sm mb-3">
                  A classic design that uses lighter fluid. Known for reliability in harsh weather conditions and has been trusted for decades.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Refill Cost:</strong> €3-8 per bottle of lighter fluid</p>
                  <p><strong>Lighter Lifespan:</strong> 10-20+ years with replaceable wicks and flints</p>
                  <p><strong>Maintenance:</strong> Regular cleaning and occasional wick/flint replacement</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">⚡ Premium Torch Lighters</h3>
                <p className="text-foreground text-sm mb-3">
                  High-performance options designed for challenging conditions. Uses butane and features multiple ignition points.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Refill Cost:</strong> €1-3 per cartridge</p>
                  <p><strong>Lighter Lifespan:</strong> 5-15+ years</p>
                  <p><strong>Maintenance:</strong> Occasional cleaning and cartridge refills</p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Refill Section */}
          <div className="rounded-lg border border-border bg-background/95 p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">How to Refill Your Lighter</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-foreground">Prepare Your Lighter</h4>
                  <p className="text-sm text-muted-foreground">Empty the existing fuel completely by pressing the refill valve with a small tool or pressing into the adjustment screw for 10-15 seconds.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-foreground">Obtain Fuel</h4>
                  <p className="text-sm text-muted-foreground">Purchase the appropriate fuel: butane cartridges (for butane lighters) or lighter fluid (for wick-based models). Both are inexpensive and widely available.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-foreground">Refill Carefully</h4>
                  <p className="text-sm text-muted-foreground">For butane: Align the cartridge nozzle with the refill valve and push firmly for 2-3 seconds. For lighter fluid: Use the applicator cap to pour slowly into the fuel chamber.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">4</div>
                <div>
                  <h4 className="font-semibold text-foreground">Test and Adjust</h4>
                  <p className="text-sm text-muted-foreground">Wait 30 seconds for pressure to stabilize, then test your lighter. Adjust the flame height using the adjustment dial if needed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Benefits */}
          <div className="rounded-lg border border-border bg-background/95 p-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Economic Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Long-term Savings</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A €20 refillable lighter can last 10+ years. With refills costing €0.50-3.00 each, you&apos;ll spend far less than someone buying disposable lighters weekly at €2-4 each.
                </p>
                <p className="text-sm text-foreground font-semibold">
                  Average annual savings: €50-100+ per person
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Convenience</h4>
                <p className="text-sm text-muted-foreground">
                  No more frequent replacements. A single refillable lighter becomes a trusted companion, reducing shopping trips and decision fatigue.
                </p>
              </div>
            </div>
          </div>

          {/* Sources Section */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">📚 Sources &amp; Further Reading</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Global lighter market data: Industry reports on disposable lighter consumption (2023-2024)</li>
              <li>• Plastic decomposition rates: United States Environmental Protection Agency (EPA)</li>
              <li>• Waste management statistics: European Environment Agency (EEA)</li>
              <li>• Heavy metal contamination: Soil and sediment studies from environmental research institutions</li>
              <li>• Product longevity data: Manufacturer specifications and consumer durability studies</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Statistics and information provided are based on available research and industry data. Individual results may vary based on usage patterns and product quality.
            </p>
          </div>
        </div>
      </div>
    );
  }