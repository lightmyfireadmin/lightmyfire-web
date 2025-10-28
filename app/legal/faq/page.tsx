// app/faq/page.tsx

export default function FAQ() {
    return (
      <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          <div className="prose prose-lg max-w-none">
            <h3>What is LightMyFire?</h3>
            <p>
              It's a project to reduce waste and create a "human
              mosaic." We sell stickers with QR codes that you put on a
              lighter. Anyone who finds that lighter can scan the code,
              enter its PIN, and add a story, picture, or song to its
              digital logbook.
            </p>
            
            <h3>How do I add a story?</h3>
            <p>
              You must find a lighter with a LightMyFire sticker. Scan
              the QR code (or go to our site) and enter the unique PIN
              from the sticker. You'll need to create a free account to
              contribute.
            </p>
  
            <h3>Why can't I post twice in a row?</h3>
            <p>
              To keep the mosaic diverse, we have a 24-hour cooldown
              period *per lighter*. This encourages you to pass the
              lighter on so someone else can add their story.
            </p>
  
            <h3>Is my post public?</h3>
            <p>
              You have two choices. All posts are visible on the
              lighter's page (which requires the PIN to access). When
              you post, you can also check a box to make it "public,"
              which allows it to be featured on our homepage mosaic.
            </p>
  
            <h3>How do I delete a post I made?</h3>
            <p>
              Log in and go to your "My Profile" page. You'll see a
              list of all your contributions with a delete button next to
              each one.
            </p>
            
            <h3>What happens if I lose the lighter I saved?</h3>
            <p>
              That's part of the fun! As the "LightSaver" (the person
              who bought the sticker), you can always see your lighter's
              page from your "My Profile" dashboard. You can watch its
              journey and see where it goes and what stories it collects
              long after it leaves your hands.
            </p>
          </div>
        </div>
      </div>
    );
  }