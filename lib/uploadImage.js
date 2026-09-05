import * as fileTypeModule from 'file-type';
import FormData from 'form-data';
import fetch from 'node-fetch';

const getFileType = async (buffer) => {
  try {
    if (fileTypeModule.fileTypeFromBuffer) return await fileTypeModule.fileTypeFromBuffer(buffer);
    if (fileTypeModule.fromBuffer) return await fileTypeModule.fromBuffer(buffer);
    if (fileTypeModule.default?.fromBuffer) return await fileTypeModule.default.fromBuffer(buffer);
    if (typeof fileTypeModule.default === 'function') return await fileTypeModule.default(buffer);
  } catch (_) {}
  return null;
};

/**
 * Upload to tmpfiles.org / uguu.se
 * @param {Buffer} content File Buffer
 * @return {Promise<string>}
 */
const uploadPomf = async (content) => {
  try {
    const { ext, mime } = (await getFileType(content)) || {};
    const timestamp = Date.now();
    const formData = new FormData();
    formData.append("files[]", content, `jerexd-${timestamp}-upload.${ext || "bin"}`);

    const response = await fetch(
      "https://uguu.se/upload.php",
      {
        method: "POST",
        body: formData,
        headers: {
          ...formData.getHeaders(),
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
    );

    const result = await response.json();
    if (!result.success || !result.files || result.files.length === 0) {
      throw new Error("Gagal upload ke uguu.se");
    }

    return result.files[0].url; // direct link!
  } catch (error) {
    console.error("Upload failed:", error.message || error);
    throw error;
  }
};

/**
 * Upload image to telegra.ph
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * @param {Buffer} buffer Image Buffer
 * @return {Promise<string>}
 */
async function uploadToTelegraph(buffer) {
  console.log("Uploading (rerouted from telegra.ph to top4top/uguu)...");
  try {
    const { uploader } = await import('./uploader.js');
    const url = await uploader(buffer);
    console.log("Uploaded successfully!", url);
    return url;
  } catch (error) {
    console.error("Upload failed:", error.message || error);
    throw error;
  }
}

/**
 * Upload to Imgur
 * @param {Buffer} imageBuffer Image Buffer
 * @param {string} clientId Imgur Client ID
 * @return {Promise<string>}
 */
async function uploadToImgur(imageBuffer, clientId) {
  console.log("Uploading to Imgur...");

  try {
    const form = new FormData();
    form.append('image', imageBuffer.toString('base64'));

    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${clientId}`
      },
      body: form
    });

    const json = await res.json();

    if (json.success) {
      console.log("Uploaded to Imgur successfully!");
      return json.data.link;
    } else {
      throw new Error(`Upload failed: ${json.data.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.error("Upload to Imgur failed:", error.message || error);
  }
}

/**
 * Upload to File.io
 * @param {Buffer} fileBuffer File Buffer
 * @return {Promise<string>}
 */
async function uploadToFileIO(fileBuffer) {
  console.log("Uploading to File.io...");

  try {
    const form = new FormData();
    form.append('file', fileBuffer);

    const res = await fetch('https://file.io', {
      method: 'POST',
      body: form
    });

    const json = await res.json();

    if (json.success) {
      console.log("Uploaded to File.io successfully!");
      return json.link;
    } else {
      throw new Error(`Upload failed: ${json.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error("Upload to File.io failed:", error.message || error);
  }
}

export { uploadPomf, uploadToTelegraph, uploadToImgur, uploadToFileIO };
export default uploadPomf;