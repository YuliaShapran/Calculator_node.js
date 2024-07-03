document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#uploadButton').addEventListener('click', uploadFile);
	document.querySelector('#meanButton').addEventListener('click', () => displayResult('mean'));
	document.querySelector('#medianButton').addEventListener('click', () => displayResult('median'));
	document.querySelector('#maxButton').addEventListener('click', () => displayResult('max'));
	document.querySelector('#minButton').addEventListener('click', () => displayResult('min'));
	document.querySelector('#downloadButton').addEventListener('click', downloadFile);
});

function showLoader() {
	document.querySelector('#loader').style.display = 'block';
}

function hideLoader() {
	document.querySelector('#loader').style.display = 'none';
}

function resetPage() {
	document.querySelector('#fileInput').value = '';
	document.querySelector('#buttons').style.display = 'none';
	document.querySelector('#results').innerText = '';
}

function uploadFile() {
	const input = document.querySelector('#fileInput');
	if (input.files.length === 0) {
		alert('Пожалуйста, выберите файл.');
		return;
	}

	const file = input.files[0];
	const formData = new FormData();
	formData.append('file', file);

	showLoader();

	fetch('/upload', {
		method: 'POST',
		body: formData
	})
		.then(response => {
		hideLoader();
		if (!response.ok) {
			return response.text().then(text => { throw new Error(text) });
		}
		return response.json();
	})
	.then(data => {
		alert(data.message);
		document.querySelector('#buttons').style.display = 'block';
	})
		.catch(error => {
		hideLoader();
		console.error('Ошибка:', error);
		alert('Произошла ошибка при обработке файла. Пожалуйста, попробуйте еще раз. Ошибка: ' + error.message);
	});
}

function displayResult(type) {
	fetch('/results')
		.then(response => {
			if (!response.ok) {
				hideLoader();
				return response.text().then(text => { throw new Error(text) });
			}
			return response.json();
		})
		.then(data => {
			let result;
			switch (type) {
					case 'mean':
						result = `Среднее: ${data.mean}`;
						break;
					case 'median':
						result = `Медиана: ${data.median}`;
						break;
					case 'max':
						result = `Наибольшее значение: ${data.max}`;
						break;
					case 'min':
						result = `Наименьшее значение: ${data.min}`;
						break;
					default:
						result = 'Неверный тип данных';
			}
			document.querySelector('#results').innerText = result;
		})
		.catch(error => {
			document.querySelector('#results').innerText = error.message;
			console.error('Ошибка:', error);
		});
}


async function downloadFile() {
	try {
		const response = await fetch('/download');
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || response.statusText);
		}
		
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const filename = 'results.txt';
		
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 100);
		resetPage();
	} catch (error) {
		console.error('Download error:', error);
		alert('Failed to download file. Please try again.');
	}
}

