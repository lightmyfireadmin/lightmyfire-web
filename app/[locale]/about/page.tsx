'use client';

import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
      <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-6 text-center text-4xl font-bold text-foreground">
          Our Philosophy
        </h1>
        <div className="space-y-6">
          <p className="lead font-semibold text-lg text-primary">
            Every lighter has a story. LightMyFire gives them a voice.
          </p>
          <div className="prose prose-lg max-w-none text-foreground">
            <p><strong>LightMyFire</strong> was born from a simple idea: what if we stopped treating lighters as throwaway items? <strong>In a world of mass consumption where billions of these items are discarded every year,</strong> what if we saw them as companions, as tiny vessels for our memories, ideas, and creativity?</p>
          </div>
          <div className="prose prose-lg max-w-none text-foreground">
            <p>We believe that when you give a lighter a name, it transforms from a simple object into something more. It becomes a witness to your moments—big and small—and a symbol of connection. Whether it&apos;s the lighter that lit your first campfire, survived a rainy festival, or traveled across continents in your pocket, <strong>it deserves to be remembered</strong>.</p>
          </div>
          <div className="prose prose-lg max-w-none text-foreground">
            <p>LightMyFire is more than a platform; it&apos;s a movement to celebrate objects that are often overlooked. By sharing stories, pictures, and videos of your lighters, you contribute to a global tapestry of memories. And when a lighter is lost, found, or passed on, its story continues—<strong>kept alive by the community</strong>.</p>
          </div>
          <div className="prose prose-lg max-w-none text-foreground">
            <p>We&apos;re not just about nostalgia; we&apos;re about sustainability too. Every lighter saved from the trash is a small step toward reducing waste. Every refill you make is a statement that <strong>things don&apos;t have to be disposable</strong>. Together, we&apos;re building a culture that values longevity, creativity, and connection.</p>
          </div>
          <Image
            src="/illustrations/around_the_world.png"
            alt="LightMyFire community around the world"
            width={300}
            height={200}
            className="mx-auto my-6"
            loading="lazy"
            quality={80}
          />
          <p className="lead mt-6 font-semibold text-lg text-primary text-center">
            Join us in giving lighters a second life, one story at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
