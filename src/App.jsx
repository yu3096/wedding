import React, { useEffect } from 'react'
import ScrollProgress from '@/components/ScrollProgress.jsx'
import HeroFullBleed from '@/components/HeroFullBleed.jsx'
import SaveTheDate from '@/components/SaveTheDate.jsx'
import Invitation from '@/components/Invitation.jsx'
import Accounts from '@/components/Accounts.jsx'
import Gallery from '@/components/Gallery.jsx'
import Maps from '@/components/Maps.jsx'
import Transport from '@/components/Transport.jsx'
import Footer from '@/components/Footer.jsx'
import Guestbook from '@/components/Guestbook.jsx'
import Appreciation from '@/components/Appreciation.jsx'
import { WeddingInfoProvider, useWeddingInfo } from '@/context/WeddingInfoProvider.jsx'
import { parseDateStr } from "@/lib/dateFormat.js";
import FloatingKakaoShareButton from "@/components/Share/FloatingShareButton.jsx";
import { initGA } from "@/lib/ga.js";

export default function App() {
  const { wedding, images } = useWeddingInfo();
  const dateObj = parseDateStr(wedding.weddingDate);

  const [isIntroComplete, setIsIntroComplete] = React.useState(false);
  const [isGalleryLoaded, setIsGalleryLoaded] = React.useState(false);

  useEffect(() => {
    initGA();
  }, []);

  return (
    <div className="min-h-screen antialiased text-neutral-900 bg-white app-root">
      <div className={`transition-opacity duration-1000 ${isIntroComplete ? 'opacity-100' : 'opacity-0'}`}>
        <ScrollProgress />
      </div>

      <HeroFullBleed
        onIntroComplete={() => setIsIntroComplete(true)}
        isGalleryLoaded={isGalleryLoaded}
      />
      <Invitation />
      <SaveTheDate year={dateObj.year} month={dateObj.month} day={dateObj.day} />
      <Gallery
        bucket="wedding-bucket"
        dir="mobile-img/gallery"
        onLoadComplete={() => setIsGalleryLoaded(true)}
      />
      <Maps />
      <Transport />
      <Accounts />
      <Guestbook />
      <Appreciation />
      <Footer />

      <FloatingKakaoShareButton imageUrl={images.thumbnail} />
    </div>
  )
}