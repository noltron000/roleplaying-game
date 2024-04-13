interface RotateOptions {
	reverse?: boolean,
	repeat?: number,
}

/**
By default, this method takes off the first item
	and puts it back on at the back.
**/
const rotateArray = <T = unknown,> (
	array: Array<T>,
	{
		reverse = false,
		repeat = 1,
	}: RotateOptions = { },
) => {
	while (repeat > 0) {
		repeat--

		if (reverse) {
			const element = array.pop( )
			if (element == null) break
			array.unshift(element)
		}
		else {
			const element = array.shift( )
			if (element == null) break
			array.push(element)
		}
	}
}

export {rotateArray}
