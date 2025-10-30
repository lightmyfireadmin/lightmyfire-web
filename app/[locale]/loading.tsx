import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Image
        src="/loading.gif"
        alt="Loading..."
        width={100}
        height={100}
        unoptimized={true} // GIFs are not optimized by next/image by default
      />
    </div>
  );
}
