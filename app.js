const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const processFile = require('./modules/fileProcessor');
const downloadFile = require('./modules/fileDownloader');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ 
	dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 10MB limit
});

app.use(express.static(path.join(__dirname, 'src')));

let resultData = null;
let resultFilePath = null;

app.post('/upload', upload.single('file'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	
	const filePath = path.join(process.cwd(), req.file.path);	
	try {
		resultFilePath = await processFile(filePath);
		resultData = JSON.parse(await fs.readFile(resultFilePath, 'utf-8'));
		await fs.unlink(filePath);
		res.status(200).json({ message: 'File processed successfully' });
	} catch (error) {
		console.error('Error processing file:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.get('/results', (req, res) => {
	if (resultData) {
		res.json(resultData);
	} else {
		res.status(404).json({ error: "Results not found." });
	}
});

app.get('/download', async (req, res) => {
if (resultFilePath) {
	try {
      await downloadFile(res, resultFilePath);
      await fs.unlink(resultFilePath);
      resultFilePath = null;
      resultData = null;
   } catch (error) {
      console.error('Error during file download:', error);
      res.status(500).json({ error: 'Error downloading file' });
		}
	} else {
		res.status(404).json({ error: "No file to download." });
	}
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});