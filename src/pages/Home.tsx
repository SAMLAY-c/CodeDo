import { useEffect } from 'react';
import useLenis from '../hooks/useLenis';
import { siteConfig } from '../config';
import Hero from '../sections/Hero';
import AlbumCube from '../sections/AlbumCube';
import ParallaxGallery from '../sections/ParallaxGallery';
import TourSchedule from '../sections/TourSchedule';
import Footer from '../sections/Footer';

function Home() {
  // Initialize Lenis smooth scrolling
  useLenis();

  useEffect(() => {
    // Set page title from config
    if (siteConfig.title) {
      document.title = siteConfig.title;
    }
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-void-black overflow-x-hidden">
      {/* Hero Section - Immersive landing */}
      <Hero />

      {/* Album Cube Section - 3D showcase */}
      <AlbumCube />

      {/* Parallax Gallery Section */}
      <ParallaxGallery />

      {/* Tour Schedule Section */}
      <TourSchedule />

      {/* Footer Section */}
      <Footer />
    </main>
  );
}

export default Home;
