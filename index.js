const fs = require('mz/fs');
const path = require('path');
const imageInfo = require('image-info');

/*壁纸所在的源文件夹*/
const src = path.join(process.env.localappdata, "\\Packages\\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets\\");
/*要拷贝到的文件夹：这个是在‘图片/spotlight’*/
const target = path.join(process.env.userprofile, 'Pictures\\spotlight');

start();

async function start() {
	await checkdir();
	await copyFile();
}

/*判断spotlight文件夹是否存在*/
async function checkdir() {
	try {
		const s = await fs.stat(target);
		if (!s.isDirectory()) {
			await fs.mkdir(target);
		}
	} catch (error) {
		await fs.mkdir(target);
	}
}

/*读取源文件目录下的所有文件*/
async function copyFile() {
	const files = await fs.readdir(src);
	files.forEach(async file => {
		const stats = await fs.stat(path.join(src, file));
		if (stats.isFile()) {
			const data = await fs.readFile(path.join(src, file));
			let filename;
			const tempData = data.slice(0, 7);
			if (tempData.indexOf(Buffer.from('FFD8FF', "hex")) != -1) {

				filename = path.join(target, file + ".jpg");

			} else if (tempData.indexOf(Buffer.from('89504E47', 'hex')) != -1) {

				filename = path.join(target, file + ".png");
			}
			if (filename) {	
				const info = await imgInfo(path.join(src, file));
				var wh = info.height / info.width;
				if (wh != 1&&info.bytes>102400) {
					await fs.writeFile(filename, data);
				}

			}
		}

	});
}


function imgInfo(filename) {
	return new Promise(function (resolve, reject) {
		imageInfo(filename, (err, info) => {
			if (err) {
				reject(err);
			}
			resolve(info);

		})
	})
}
