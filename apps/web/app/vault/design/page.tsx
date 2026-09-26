import type { Metadata } from "next";
import { DesignStudio } from "@/components/design/design-studio";

export const metadata: Metadata = {
	robots: { follow: false, index: false },
	title: "site design",
};

export default function VaultDesignPage() {
	return <DesignStudio />;
}
