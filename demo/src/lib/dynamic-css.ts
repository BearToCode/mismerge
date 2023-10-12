export function loadDynamicStylesheet(data: string) {
	const style = document.createElement('style');
	style.innerHTML = data;
	document.head.appendChild(style);

	return () => {
		document.head.removeChild(style);
	};
}
