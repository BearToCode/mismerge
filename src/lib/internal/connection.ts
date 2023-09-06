import type { DiffBlock, MountedDiffBlock } from './blocks';

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
		} else if (block.type == 'partially_added') {
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

export function drawConnections(canvas: HTMLCanvasElement, connections: BlockConnection[]) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const width = canvas.width;

	for (const connection of connections) {
		if (!connection.from.elem || !connection.to.elem) continue;

		ctx.beginPath();
		const fromOffsetTop = connection.from.elem.offsetTop;
		const toOffsetTop = connection.to.elem.offsetTop;
		const fromHeight = connection.from.elem.clientHeight;
		const toHeight = connection.to.elem.clientHeight;
		ctx.moveTo(fromOffsetTop, 0);
		ctx.lineTo(toOffsetTop, width);
		ctx.lineTo(toOffsetTop + toHeight, width);
		ctx.lineTo(fromOffsetTop + fromHeight, 0);
		ctx.fill();
		ctx.closePath();
	}
}
