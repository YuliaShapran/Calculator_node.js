
const fs = require('fs').promises;
const path = require('path');

async function processFile(filePath) {
	try {
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const numbers = fileContent.trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && isFinite(n));

		if (numbers.length === 0) {
			throw new Error("File does not contain any valid numbers.");
		}
		
		let max = numbers[0];
		let min = numbers[0];
		let sum = 0;
		numbers.forEach((element) => {
			if (element > max) max = element;
			if (element < min) min = element;
			sum += element;
		});
		const mean = sum / numbers.length;
		


		const sortedNumbers = [...numbers].sort((a, b) => a - b);
		const midIndex = Math.floor(sortedNumbers.length / 2);
		const median = sortedNumbers.length % 2 === 0
			? (sortedNumbers[midIndex - 1] + sortedNumbers[midIndex]) / 2
			: sortedNumbers[midIndex];

		const incSeq = findLongestSequence(numbers, (a, b) => a < b);
		const decSeq = findLongestSequence(numbers, (a, b) => a > b);

		const result = {
			max,
			min,
			mean,
			sum,

			median,
			increasingSequence: incSeq,
			decreasingSequence: decSeq
		};

		const resultFilePath = path.join(path.dirname(filePath), 'results.json');
		await fs.writeFile(resultFilePath, JSON.stringify(result, null, 2));

		return resultFilePath;
	} catch (error) {
		console.error('Error processing file:', error);
		throw error;
	}
}

function findLongestSequence(numbers, comparator) {
	let longestSeq = [];
	let currentSeq = [];

	for (let i = 0; i < numbers.length; i++) {
		if (currentSeq.length === 0 || comparator(currentSeq[currentSeq.length - 1], numbers[i])) {
			currentSeq.push(numbers[i]);
		} else {
			if (currentSeq.length > longestSeq.length) {
					longestSeq = [...currentSeq];
			}
			currentSeq = [numbers[i]];
		}
	}

	if (currentSeq.length > longestSeq.length) {
		longestSeq = currentSeq;
	}

	return longestSeq;
}

module.exports = processFile;