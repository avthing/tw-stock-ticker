# Chrome 線上應用程式商店上架文案（台股跑馬燈）

> 各欄位字數限制：標題 75、摘要 132、說明 16,000（Chrome 商店規定）。

## 商店資訊 › 產品詳細資料

### 套件標題
```
台股跑馬燈
```

### 套件摘要
```
在任何網頁上以跑馬燈輪播自選台股的股價與漲跌，支援上市櫃、ETF 與加權指數，盤中自動更新。
```

### 說明
```
上班、上課、追劇、看新聞時，不必再切換視窗看盤。台股跑馬燈把你的自選股做成像新聞台一樣的跑馬燈，貼在任何網頁的邊緣，隨時瞄一眼就知道漲跌。

【為什麼安裝】
• 不用切換分頁或視窗，瀏覽網頁的同時就能掌握自選股與大盤
• 紅漲綠跌（台股慣例）與綠漲紅跌（美股慣例）一鍵切換，顏色也能自訂
• 不佔版面、不干擾：可最小化、可暫停、可排除特定網站，想看的時候才出現

【主要功能】
1. 自選股模糊搜尋
輸入名稱或代號即可加入，例如「台積」、「元大50」、「2330」。支援上市、上櫃、ETF、加權指數與櫃買指數。

2. 四個位置任選
上、下方為橫向跑馬燈；左、右側為直向窄欄，由下往上捲動。

3. 台股慣例的漲跌變色
預設紅漲綠跌，可切換成綠漲紅跌，文字與背景色號都能自訂。

4. 整頁淡色濾鏡（預設關閉）
依加權指數漲跌，替整個網頁加上淡淡的紅色或綠色調，不用看數字也知道大盤方向。

5. 防窺模式（預設關閉）
平時完全隱藏，只有滑鼠移到跑馬燈所在的畫面邊緣才會滑出，移開 0.5 秒後自動收起，上班看盤更低調。

6. 排除網站、暫停與最小化
預設排除 youtube.com 與 netflix.com（子網域一併排除），可自行增減。滑鼠移到跑馬燈上會暫停捲動；最小化後所有分頁同步。

7. 新手教學
安裝後自動開啟教學頁，一步步帶你完成設定。

【使用方式】
1. 安裝後依新手教學頁的指引操作
2. 點工具列的擴充功能圖示，開啟設定頁
3. 在「自選股」輸入名稱或代號，加入想追蹤的股票
4. 選擇跑馬燈位置、速度與顏色，儲存後即可在網頁上看到跑馬燈

【資料來源與更新頻率】
• 報價來自臺灣證券交易所公開行情介面（mis.twse.com.tw），股票清單來自證交所與櫃買中心的 OpenAPI
• 僅在盤中（台北時間週一至週五 09:00–13:35）每 1 分鐘更新一次，不是逐筆即時；報價本身約有數秒延遲，跑馬燈右側會顯示最後更新時間
• 非盤中時顯示上一個交易日的收盤價

【隱私】
• 不蒐集、不上傳任何個人資料，沒有帳號、沒有廣告、沒有追蹤
• 自選股與設定只儲存在你的瀏覽器（chrome.storage），不會傳送給開發者或第三方
• 只會向證交所與櫃買中心的公開介面請求行情與股票清單

【已知限制】
• Chrome 的限制：chrome:// 頁面、Chrome 線上應用程式商店與內建 PDF 檢視器無法顯示跑馬燈
• 安裝前就已開啟的分頁需要重新整理才會出現跑馬燈
• 換頁時跑馬燈會從頭開始捲動
• 若請求過於頻繁，證交所介面可能暫時限制存取，因此更新頻率固定為每分鐘一次

【免責聲明】
本擴充功能為獨立開發的第三方工具，與臺灣證券交易所、證券櫃檯買賣中心無任何關聯。顯示的資訊僅供參考，不構成任何投資建議，投資人應自行判斷並承擔風險。

官方網站與使用教學：https://tw-stock-ticker.pages.dev
原始碼與問題回報：https://github.com/avthing/tw-stock-ticker
```

### 類別
`生產力`（Productivity）。備選：`新聞與天氣`。商店沒有「財經」類別。

### 語言
`中文（繁體）`

## 其他欄位

| 欄位 | 填寫內容 |
|---|---|
| 官方網址 | 留空。此欄需先在 Google Search Console 驗證網站擁有權，且 `pages.dev` 子網域通常無法驗證 |
| 首頁網址 | `https://tw-stock-ticker.pages.dev` |
| 支援網址 | `https://github.com/avthing/tw-stock-ticker/issues` |
| 成人內容 | 否（不勾選） |
| 通用宣傳影片 | 留空（選填） |

## 隱私權設定分頁（送審必填）

### 單一用途
```
在使用者瀏覽的網頁上，以跑馬燈顯示使用者自選的台股股價與漲跌。
```

### 權限使用理由
| 權限 | 理由（貼進對應欄位） |
|---|---|
| `storage` | Stores the user's watchlist and display settings (position, colors, speed, excluded sites) in the browser. |
| `alarms` | Schedules the once-per-minute quote refresh, which only runs during Taiwan market hours. |
| `https://mis.twse.com.tw/*` | Fetches real-time stock quotes from the Taiwan Stock Exchange public market data endpoint. |
| `https://openapi.twse.com.tw/*`、`https://www.tpex.org.tw/*` | Downloads the public list of listed stocks and ETFs (TWSE and TPEx) so users can search by name or code when building their watchlist. |
| 內容腳本 `<all_urls>` | The core feature is a ticker bar overlaid on whatever page the user is browsing. It must be injected into all websites; it only draws a UI element, and never reads, collects or modifies page content. Users can exclude specific sites in settings. |

### 遠端程式碼
`否`，不使用遠端託管的程式碼。

### 資料使用
全部不勾選（不蒐集任何使用者資料）；三項聲明（不販售、不用於無關用途、不用於信用評估）都勾選同意。

## 圖片資產規格對照

| 項目 | 規格 | 檔名 |
|---|---|---|
| 商店圖示 | 128×128 PNG | `store/images/icon-128.png` |
| 螢幕截圖（至少 1、最多 5） | 1280×800，24 位元 PNG／JPEG，無 alpha | `store/images/screenshot-1.png` … |
| 小型宣傳圖塊 | 440×280，24 位元 PNG／JPEG，無 alpha | `store/images/promo-small.png` |
| 跑馬燈宣傳圖塊 | 1400×560，24 位元 PNG／JPEG，無 alpha | `store/images/promo-marquee.png` |
