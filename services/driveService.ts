import axios from 'axios';

const DRIVE_FILE_NAME = 'nintendo_collector_backup.json';

export async function syncToDrive(tokens: any, data: any) {
  try {
    const accessToken = tokens.access_token;
    
    // 1. Check if file exists
    const listResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FILE_NAME}' and trashed=false`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const files = listResponse.data.files;
    let fileId = files.length > 0 ? files[0].id : null;

    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: 'application/json',
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    if (fileId) {
      // 2. Update existing file
      await axios.patch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } else {
      // 3. Create new file
      await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    return true;
  } catch (error) {
    console.error('Error syncing to Google Drive:', error);
    throw error;
  }
}

export async function downloadFromDrive(tokens: any) {
  try {
    const accessToken = tokens.access_token;
    
    const listResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FILE_NAME}' and trashed=false`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const files = listResponse.data.files;
    if (files.length === 0) return null;

    const fileId = files[0].id;
    const contentResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return contentResponse.data;
  } catch (error) {
    console.error('Error downloading from Google Drive:', error);
    throw error;
  }
}
