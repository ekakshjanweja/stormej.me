"use client";

import { forwardRef, memo } from "react";
import {
	Cursor,
	CursorBody,
	CursorMessage,
	CursorName,
	CursorPointer,
} from "@/components/kibo-ui/cursor";
import { getContrastColor } from "./utils";

interface UserCursorProps {
	color: string;
	currentMessage: string;
	isChatMode: boolean;
	messages: Array<{ text: string; timestamp: number }>;
	name: string;
	position: { x: number; y: number };
}

export const UserCursor = memo(
	forwardRef<HTMLDivElement, UserCursorProps>(function UserCursor(
		{ color, name, messages, isChatMode, currentMessage, position },
		ref
	) {
		const contrast = getContrastColor(color);

		return (
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
			>
				<div
					className="absolute will-change-transform"
					ref={ref}
					style={{
						transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
					}}
				>
					<Cursor>
						<CursorPointer style={{ color }} />
						<CursorBody style={{ backgroundColor: color, color: contrast }}>
							<CursorName>{name}</CursorName>
							{messages.map((msg, idx) => (
								<CursorMessage
									className={idx < messages.length - 1 ? "opacity-60" : ""}
									key={msg.timestamp}
								>
									{msg.text}
								</CursorMessage>
							))}
							{isChatMode && (
								<CursorMessage className="italic opacity-80">
									{currentMessage || (
										<span className="opacity-60">type a message...</span>
									)}
									<span className="animate-pulse">|</span>
								</CursorMessage>
							)}
							{!isChatMode && messages.length === 0 && (
								<CursorMessage className="text-[10px] opacity-60">
									press{" "}
									<kbd className="mx-0.5 rounded bg-black/20 px-1 py-0.5">
										/
									</kbd>{" "}
									to chat
								</CursorMessage>
							)}
						</CursorBody>
					</Cursor>
				</div>
			</div>
		);
	})
);
