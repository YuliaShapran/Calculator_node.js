
const fs = require('fs');
const path = require('path');

async function downloadFile(res, filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			throw new Error('File not found');
		}

		const fileName = path.basename(filePath);
		const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');

		res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
		res.setHeader('Content-Type', 'application/octet-stream');

		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);

		await new Promise((resolve, reject) => {
			fileStream.on('end', resolve);
			fileStream.on('error', reject);
		});

	} catch (error) {
		console.error("Error downloading the file:", error);
		res.status(error.message === 'File not found' ? 404 : 500)
			.json({ error: error.message || "Error downloading the file" });
	}
}

module.exports = downloadFile;