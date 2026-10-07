import HeroSection from "./HeroSection";
import LatestPostsSection from "./LatestPostsSection";

export default function HomePage() {
  return (
      <div className="container mx-auto px-4 pt-6 md:px-6">
        <HeroSection />
        <LatestPostsSection />
      </div>
  );
}