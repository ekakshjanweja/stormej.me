import { Catchphrase } from "./_components/catchphrase";
import { Faq } from "./_components/faq";
import { FinalCta } from "./_components/final-cta";
import { Hero } from "./_components/hero";
import { Usps } from "./_components/usps";
import { Ways } from "./_components/ways";
import { WorkGrid } from "./_components/work-grid";

/* the header, footer and skip link live in the studio layout */

export default function Studio() {
	return (
		<>
			<Hero />
			<Usps />
			<WorkGrid />
			<Catchphrase />
			<Ways />
			<Faq />
			<FinalCta />
		</>
	);
}
