import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

interface BlogsPageLayoutProps {
  children: React.ReactNode;
}

const BlogsPageLayout = ({ children }: BlogsPageLayoutProps) => {
  return (
    <>
      <div className="flex justify-center px-4 md:px-0">
        <div className=" md:max-w-screen-sm">
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default BlogsPageLayout;
