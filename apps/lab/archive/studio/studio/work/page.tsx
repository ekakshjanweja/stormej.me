import type { Metadata } from "next";
import { Facts } from "../_components/facts";
import { PageHero } from "../_components/page-hero";
import { WorkIndex } from "../_components/work-index";
import { WORK_PAGE } from "../_lib/pages";

export const metadata: Metadata = {
	description: WORK_PAGE.text,
	title: "work",
};

export default function WorkPage() {
	return (
		<>
			<PageHero
				eyebrow="work"
				foot={<Facts items={WORK_PAGE.facts} label="in numbers" />}
				title={WORK_PAGE.title}
			>
				<p>{WORK_PAGE.text}</p>
			</PageHero>
			<WorkIndex />
		</>
	);
}
