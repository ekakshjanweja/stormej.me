import Image from "next/image";
import { withBase } from "@/lib/base";
import { ARCHIVED, EXPERIMENTS } from "@/lib/experiments";
import { LINKS, PERSON, SITE } from "@/lib/profile";

export default function Lab() {
	return (
		<main className="lab">
			<header className="lab-head">
				<a className="lab-mark" href={SITE}>
					{PERSON.name}
				</a>
				<span className="lab-crumb">/ lab</span>
			</header>

			<section aria-labelledby="lab-title" className="lab-intro">
				<h1 id="lab-title">
					the <em>lab</em>
				</h1>
				<p>
					experiments in how this portfolio could feel. each one borrows the
					bones of a site i like and dresses them in mine: sage paper, serif
					headlines, lowercase everything. one is live; the rest are archived.
					none of them are the site yet.
				</p>
			</section>

			<ol className="lab-list">
				{EXPERIMENTS.map((experiment, index) => (
					<li className="lab-row" key={experiment.slug}>
						<a className="lab-link" href={withBase(experiment.href)}>
							<span aria-hidden="true" className="lab-index">
								{String(index + 1).padStart(2, "0")}
							</span>
							<span className="lab-title">{experiment.title}</span>
							<span aria-hidden="true" className="lab-arrow">
								→
							</span>
							<span className="lab-summary">{experiment.summary}</span>
							<span aria-hidden="true" className="lab-cover">
								<Image
									alt=""
									height={240}
									src={withBase(experiment.image)}
									width={180}
								/>
							</span>
						</a>
						<div className="lab-meta">
							<nav
								aria-label={`${experiment.title} pages`}
								className="lab-pages"
							>
								<ul>
									{experiment.pages.map((page) => (
										<li key={page.href}>
											<a href={withBase(page.href)}>{page.label}</a>
										</li>
									))}
								</ul>
							</nav>
							<p className="lab-after">
								after{" "}
								<a
									href={experiment.after.href}
									rel="noopener noreferrer"
									target="_blank"
								>
									{experiment.after.label}
									<span className="sr-only"> (opens in a new tab)</span>
								</a>
							</p>
						</div>
					</li>
				))}
			</ol>

			<section aria-labelledby="lab-archived" className="lab-archive">
				<h2 className="lab-archive-title" id="lab-archived">
					archived
				</h2>
				<ul className="lab-list">
					{ARCHIVED.map((experiment) => (
						<li className="lab-row lab-row-archived" key={experiment.slug}>
							<div className="lab-link">
								<span aria-hidden="true" className="lab-index">
									—
								</span>
								<h3 className="lab-title">{experiment.title}</h3>
								<span className="lab-status">not live</span>
								<p className="lab-summary">{experiment.summary}</p>
							</div>
							<div className="lab-meta">
								<p className="lab-after">
									after{" "}
									<a
										href={experiment.after.href}
										rel="noopener noreferrer"
										target="_blank"
									>
										{experiment.after.label}
										<span className="sr-only"> (opens in a new tab)</span>
									</a>
								</p>
							</div>
						</li>
					))}
				</ul>
			</section>

			<footer className="lab-foot">
				<a href={SITE}>back to stormej.me</a>
				<a href={LINKS.instagram} rel="noopener noreferrer" target="_blank">
					@stormej.studio
					<span className="sr-only"> on instagram (opens in a new tab)</span>
				</a>
			</footer>
		</main>
	);
}
