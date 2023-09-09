import type { DiffBlock, MountedDiffBlock } from './blocks';
import type { EditorColors } from './colors';

export type BlockConnection<
	From extends DiffBlock = DiffBlock,
	To extends DiffBlock = DiffBlock
> = {
	from: MountedDiffBlock<From>;
	to: MountedDiffBlock<To>;
};

/**
 * Generates connections between diff blocks.
 * @param blocks The blocks to generate connections for.
 * @returns The connections between the blocks.
 */
export function generateConnections(blocks: MountedDiffBlock[]) {
	const connections: BlockConnection[] = [];
	for (const block of blocks) {
		if (block.type == 'added_placeholder') {
			const referenceBlock = blocks.find((b) => b.id == block.referenceBlock.id);
			if (referenceBlock)
				connections.push({
					from: block,
					to: referenceBlock
				});
		} else if (block.type == 'removed_placeholder') {
			const referenceBlock = blocks.find((b) => b.id == block.referenceBlock.id);
			if (referenceBlock)
				connections.push({
					from: referenceBlock,
					to: block
				});
		} else if (block.type == 'partially_removed') {
			const referenceBlock = blocks.find((b) => b.id == block.referenceId);
			if (referenceBlock)
				connections.push({
					from: block,
					to: referenceBlock
				});
		}
	}
	return connections;
}

export function drawConnections(
	canvas: HTMLCanvasElement,
	connections: BlockConnection[],
	colors: EditorColors,
	lhsViewElem: HTMLElement,
	rhsViewElem: HTMLElement
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const width = canvas.width;

	for (const connection of connections) {
		if (!connection.from.elem || !connection.to.elem) continue;
		const fromOffsetTop =
			connection.from.elem.getBoundingClientRect().top - lhsViewElem.getBoundingClientRect().top;
		const toOffsetTop =
			connection.to.elem.getBoundingClientRect().top - rhsViewElem.getBoundingClientRect().top;
		const fromHeight = connection.from.elem.offsetHeight;
		const toHeight = connection.to.elem.offsetHeight;

		const BezierOffset = 8;

		ctx.beginPath();
		ctx.moveTo(0, fromOffsetTop);
		ctx.bezierCurveTo(
			BezierOffset, // first control point x
			fromOffsetTop, // first control point y
			width - BezierOffset, // second control point x
			toOffsetTop, // second control point y
			width, // end x
			toOffsetTop // end y
		);
		ctx.lineTo(width, toOffsetTop + toHeight);
		ctx.bezierCurveTo(
			width - BezierOffset,
			toOffsetTop + toHeight,
			BezierOffset,
			fromOffsetTop + fromHeight,
			0,
			fromOffsetTop + fromHeight
		);
		if (connection.from.type == 'added' || connection.from.type == 'added_placeholder')
			ctx.fillStyle = colors.darkGreen;
		else if (connection.from.type == 'removed' || connection.from.type == 'removed_placeholder')
			ctx.fillStyle = colors.darkRed;
		else {
			const gradient = ctx.createLinearGradient(0, 0, width, 0);
			gradient.addColorStop(0, colors.lightRed);
			gradient.addColorStop(1, colors.lightGreen);
			ctx.fillStyle = gradient;
		}
		ctx.fill();
		ctx.closePath();
	}
}
