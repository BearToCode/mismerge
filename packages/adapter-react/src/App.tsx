import { DefaultDarkColors, MisMerge3 } from './lib';
import { useEffect, useState } from 'react';
import '@mismerge/core/styles.css';
import '@mismerge/core/dark.css';

function App() {
	const [ctr, setCtr] = useState('Hello world!');

	useEffect(() => {
		console.log(ctr);
	}, [ctr]);

	return (
		<>
			<MisMerge3
				lhs="Hello world!"
				ctr={ctr}
				rhs="Hello world!"
				onCtrChange={setCtr}
				colors={DefaultDarkColors}
				wrapLines={true}
			/>
		</>
	);
}

export default App;
