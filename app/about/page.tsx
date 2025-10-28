export default function AboutPage() {
    return (
      <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-4xl font-bold text-gray-900">
            Our Philosophy
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="lead text-xl text-gray-700">
              We believe that even the smallest, most disposable object can
              carry a great story.
            </p>
            <p>
              <strong>LightMyFire</strong> was born from a simple idea: what if we
              stopped treating lighters as throwaway items? What if we saw
              them as companions, as tiny vessels for our memories, ideas, and
              creativity?
            </p>
            <p>
              The everyday lighter is no personal possession; it belongs to
              everyone. It passes from hand to hand, from friend to stranger,
              at parties, concerts, and quiet meetups. It hears our secrets and
              lights our way.
            </p>
            <p>
              By giving a lighter a permanent, digital story, we give it
              sentimental value. And when something has value, we're less
              likely to throw it away.
            </p>
            <p>
              Our goal is simple: to create a global, human creativity mosaic,
              one lighter at a time, and reduce waste in the process.
            </p>
          </div>
        </div>
      </div>
    );
  }