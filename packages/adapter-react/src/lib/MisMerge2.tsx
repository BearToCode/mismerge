import '@mismerge/core/web';
import type { EditorColors, Highlighter, LineDiffAlgorithm } from '@mismerge/core';
import { useEffect, useRef } from 'react';

export function MisMerge2({
	lhs,
	rhs,
	onLhsChange,
	onRhsChange,
	colors,
	lhsEditable,
	rhsEditable,
	lineDiffAlgorithm,
	className,
	disableMerging,
	wrapLines,
	disableFooter,
	disableWordsCounter,
	disableBlocksCounter,
	highlight,
	ignoreWhitespace,
	ignoreCase
}: {
	lhs: string;
	rhs: string;
	onLhsChange?: (lhs: string) => void;
	onRhsChange?: (rhs: string) => void;
	colors?: EditorColors;
	lhsEditable?: boolean;
	rhsEditable?: boolean;
	lineDiffAlgorithm?: LineDiffAlgorithm;
	className?: string;
	disableMerging?: boolean;
	wrapLines?: boolean;
	disableFooter?: boolean;
	disableWordsCounter?: boolean;
	disableBlocksCounter?: boolean;
	highlight?: Highlighter;
	ignoreWhitespace?: boolean;
	ignoreCase?: boolean;
}) {
	const ref = useRef<JSX.IntrinsicElements['mis-merge2']>(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.highlight = highlight;
		}
	}, [highlight]);

	return (
		<mis-merge2
			ref={ref}
			lhs={lhs}
			rhs={rhs}
			onInput={() => {
				if (onLhsChange) {
					onLhsChange(ref.current.lhs);
				}
				if (onRhsChange) {
					onRhsChange(ref.current.rhs);
				}
			}}
			colors={JSON.stringify(colors)}
			lhsEditable={lhsEditable}
			rhsEditable={rhsEditable}
			lineDiffAlgorithm={lineDiffAlgorithm}
			class={className}
			disableMerging={disableMerging}
			wrapLines={wrapLines}
			disableFooter={disableFooter}
			disableWordsCounter={disableWordsCounter}
			disableBlocksCounter={disableBlocksCounter}
			highlight={highlight}
			ignoreWhitespace={ignoreWhitespace}
			ignoreCase={ignoreCase}
		/>
	);
}
