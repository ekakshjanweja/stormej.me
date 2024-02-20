import { Navbar } from "@/components/navbar";

interface HomePageLayoutProps {
  children: React.ReactNode;
}

const HomePageLayout = ({ children }: HomePageLayoutProps) => {
  return (
    <>
      <div className="flex justify-center px-6 md:px-0">
        <div className=" md:max-w-screen-sm">
          <Navbar />
          {children}
          <Navbar />
        </div>
      </div>
    </>
  );
};

export default HomePageLayout;
