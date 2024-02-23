import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { RadialGradient } from "@/components/radial-gradient";
import { Spotlight } from "@/components/ui/spotlight";

interface HomePageLayoutProps {
  children: React.ReactNode;
}

const HomePageLayout = ({ children }: HomePageLayoutProps) => {
  return (
    <>
      <div className="flex justify-center px-4 md:px-0">
        <div className=" md:max-w-screen-sm">
          {/* <RadialGradient></RadialGradient> */}
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default HomePageLayout;
