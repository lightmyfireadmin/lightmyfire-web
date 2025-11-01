// app/faq/page.tsx

import Image from 'next/image'; // Import Image component

export default function FAQ() {
    return (
      <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
          <Image
            src="/illustrations/assistance_questions.png"
            alt="Frequently Asked Questions"
            width={150}
            height={150}
            className="mx-auto mb-6"
          />
          <h1 className="mb-6 text-center text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <div className="prose prose-lg max-w-none">
            <h3>What is LightMyFire?</h3>
            <p>
              It&apos;s a project to reduce waste and create a &quot;human
              mosaic.&quot; We sell stickers with QR codes that you put on a
              lighter. Anyone who finds that lighter can scan the code,
              enter its PIN, and add a story, picture, or song to its
              digital logbook.
            </p>
            
            <h3>How do I add a story?</h3>
            <p>
              You must find a lighter with a LightMyFire sticker. Scan
              the QR code (or go to our site) and enter the unique PIN
              from the sticker. You&apos;ll need to create a free account to
              contribute.
            </p>
  
            <h3>Why can&apos;t I post twice in a row?</h3>
            <p>
              To keep the mosaic diverse, we have a 24-hour cooldown
              period *per lighter*. This encourages you to pass the
              lighter on so someone else can add their story.
            </p>
  
            <h3>Is my post public?</h3>
            <p>
              You have two choices. All posts are visible on the
              lighter&apos;s page (which requires the PIN to access). When
              you post, you can also check a box to make it &quot;public,&quot;
              which allows it to be featured on our homepage mosaic.
            </p>
  
            <h3>How do I delete a post I made?</h3>
            <p>
              Log in and go to your &quot;My Profile&quot; page. You&apos;ll see a
              list of all your contributions with a delete button next to
              each one.
            </p>
            
            <h3>What happens if I lose the lighter I saved?</h3>
            <p>
              That&apos;s part of the fun! As the &quot;LightSaver&quot; (the person
              who bought the sticker), you can always see your lighter&apos;s
              page from your &quot;My Profile&quot; dashboard. You can watch its
              journey and see where it goes and what stories it collects
              long after it leaves your hands.
            </p>
            
            <h3>How does the map work?</h3>
            <p>
              On each lighter&apos;s page, you&apos;ll find a map that shows the journey of that specific lighter.
              Every time someone makes a &quot;location&quot; post, the coordinates are recorded and added to the map,
              tracing the lighter&apos;s path across the globe.
            </p>
          </div>
        </div>
      </div>
    );
  }