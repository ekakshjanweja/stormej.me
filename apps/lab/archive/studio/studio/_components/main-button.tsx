/* the label stack for .btn-main: the resting label slides up and out, a
   fill swells from below, and a second copy of the label rises into place.
   the copy is aria-hidden so the name is read once */

export function MainButtonLabel({ children }: { children: string }) {
	return (
		<>
			<span aria-hidden="true" className="btn-main-fill" />
			<span className="btn-main-label">{children}</span>
			<span aria-hidden="true" className="btn-main-label btn-main-label-hover">
				{children}
			</span>
		</>
	);
}
