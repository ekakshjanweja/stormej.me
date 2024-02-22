import { Navbar } from "@/components/navbar";
import { RadialGradient } from "@/components/radial-gradient";
import { Spotlight } from "@/components/ui/spotlight";

interface BlogsPageLayoutProps {
  children: React.ReactNode;
}

const BlogsPageLayout = ({ children }: BlogsPageLayoutProps) => {
  return (
    <>
      <div className="flex justify-center px-4 md:px-0">
        <div className=" md:max-w-screen-sm">
          {/* <RadialGradient></RadialGradient> */}
          <Navbar />
          {children}
          <Navbar />
        </div>
      </div>
    </>
  );
};

export default BlogsPageLayout;
