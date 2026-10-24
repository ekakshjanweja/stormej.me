export interface LoaderProps {
	/** called once the loader has fully let go of the page */
	onDone: () => void;
}

/** every loader is a full-screen cover above the navbar and the page */
export const COVER = "fixed inset-0 z-[200] overflow-hidden";
