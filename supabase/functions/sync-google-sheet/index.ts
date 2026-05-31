// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

// 此端點使用 secret 權限，因為是由 pg_cron (內部伺服器) 呼叫
// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {

    try{

      const { eventId, sheetId } = await req.json(); 

      if (!sheetId || !eventId) {
        return Response.json({ error: "請求內文中缺少 eventId, sheetId" }, { status: 400 });
      }

      // 🔐 GCP 憑證依然留在環境變數，因為所有表單共用同一個 Service Account 權限
      const serviceAccountJson = Deno.env.get("GCP_SERVICE_ACCOUNT");
      // 1. 取得 Google 授權 (實務上需引入 JWT 產生工具，此處簡化示意)
      const googleToken = await getGoogleAccessToken(serviceAccountJson);

      // 2. 呼叫 Google Sheets API 抓取資料 (假設 A 到 D 欄)
      const sheetResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:D`, {
        headers: {
          "Authorization": `Bearer ${googleToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!sheetResponse.ok) {
        throw new Error(`Google API 回應錯誤: ${sheetResponse.statusText}`);
      }

      const sheetData = await sheetResponse.json();
      const rows = sheetData.values;

      // 如果只有標題行或沒資料，提早返回
      if (!rows || rows.length <= 1) {
        return Response.json({ message: "No data to sync" }, { status: 200 });
      }

      // 4. 整理資料格式 (略過第一行標題)
      const formattedData = rows.slice(1).map((row: any, index: number) => ({
        event_id: eventId,
        email: row[1], // 假設 Email 在 B 欄 (index 1)
        name: row[0], // 假設姓名在 C 欄 (index 2)
        google_sheet_row_id: `row_${index + 2}`,
        form_submitted_at: new Date(row[0]).toISOString() // 假設時間戳在 A 欄 (index 0)
      }));

      // 5. 寫入資料庫
      // 這裡直接使用 ctx.supabaseAdmin，它會自動使用 Service Role Key，具備最高寫入權限
      const { error } = await ctx.supabaseAdmin
        .from("event_registrations")
        .upsert(formattedData, {
          onConflict: "event_id, email",
          ignoreDuplicates: true // 核心防呆：如果 Email 已經存在就略過
        })
      
      if (error) throw error;

      // 使用新版樣板推薦的 Response.json() 回傳結果
      return Response.json({
        message: "Google Sheet data synced successfully",
        processedCount: formattedData.length
      })

    }catch (error: any) {
      console.error("Error in sync-google-sheet function:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
};

/**
 * 輔助函式：產生 Google API 需要的 Access Token
 * 注意：在 Edge Function 中，您可能需要使用 Deno 相容的 JWT 套件 (如 'jose') 來實作此段
 */

async function getGoogleAccessToken(serviceAccountJson: string | undefined): Promise<string> {
  if (!serviceAccountJson) throw new Error("Missing GCP_SERVICE_ACCOUNT environment variable");

  // 這裡需要實作將 Service Account 轉換為 Bearer Token 的邏輯
  // 可參考 Deno 的 jwt 生成範例，簽署範圍包含 'https://www.googleapis.com/auth/spreadsheets.readonly'

  return "Your_Generated_Access_Token"; // 這裡僅為示意，實際應返回有效的 Access Token
}
