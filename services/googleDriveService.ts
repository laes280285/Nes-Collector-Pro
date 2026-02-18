
/**
 * Servicio para manejar la integración con Google Drive REST API.
 * Requiere un Client ID válido de la consola de Google Cloud.
 */

export interface BackupPayload {
  games: any[];
  settings: any;
  timestamp: number;
}

const SCOPES = "https://www.googleapis.com/auth/drive.file";
let accessToken: string | null = null;

export async function requestDrivePermission(clientId: string): Promise<{ email: string; token: string } | null> {
  if (!clientId || clientId.includes("TU_CLIENT_ID")) {
    throw new Error("CLIENT_ID_MISSING");
  }

  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error !== undefined) {
            console.error("Google Auth Error:", response);
            reject(response);
            return;
          }
          accessToken = response.access_token;
          
          try {
            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            }).then(res => res.json());

            resolve({ email: userInfo.email, token: accessToken! });
          } catch (e) {
            console.error("Error fetching user info:", e);
            resolve({ email: "Cuenta vinculada", token: accessToken! });
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error("Error al inicializar Google Auth:", error);
      reject(error);
    }
  });
}

export async function uploadToDrive(data: BackupPayload, token?: string): Promise<boolean> {
  const activeToken = token || accessToken;
  if (!activeToken) return false;

  try {
    const filename = `NintyCollector_Backup_${new Date().toISOString().split('T')[0]}.json`;
    const metadata = {
      name: filename,
      mimeType: "application/json",
    };

    const fileContent = JSON.stringify(data);
    const file = new Blob([fileContent], { type: "application/json" });

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${activeToken}` },
        body: form,
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error de red al subir a Drive:", error);
    return false;
  }
}

export async function checkAutoBackupWeekly(lastBackup: number | undefined): Promise<boolean> {
  if (!lastBackup) return true;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return (Date.now() - lastBackup) > SEVEN_DAYS_MS;
}
