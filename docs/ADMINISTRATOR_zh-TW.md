# 管理功能

## 先決條件

管理員使用者必須是名為 `Admin` 的群組成員，可以透過管理主控台 > Amazon Cognito 使用者池或 AWS CLI 進行設定。請注意，可以透過存取 CloudFormation > BedrockChatStack > 輸出 > `AuthUserPoolIdxxxx` 來引用使用者池 ID。

![](./imgs/group_membership_admin.png)

## 將公開機器人標記為「必要」

現在，管理員可以將公開機器人標記為「必要」。被標記為必要的機器人將在機器人商店的「必要」區段中突出顯示，使用戶可以輕鬆存取。這使管理員可以置頂他們希望所有用戶使用的重要機器人。

### 範例

- 人力資源助理機器人：幫助員工解決人力資源相關的問題和任務。
- IT 支援機器人：為內部技術問題和帳戶管理提供協助。
- 內部政策指南機器人：回答有關出勤規則、安全政策和其他內部規定的常見問題。
- 新員工入職機器人：指導新員工在第一天完成流程並使用系統。
- 福利資訊機器人：解釋公司福利計劃和福利服務。

![](./imgs/admin_bot_menue.png)
![](./imgs/bot_store.png)

## 回饋迴路

來自大型語言模型（LLM）的輸出可能不總是符合使用者的期望。有時無法滿足使用者的需求。為了有效地將大型語言模型整合到商業運營和日常生活中，實施回饋迴路是至關重要的。Bedrock Chat 配備了一個回饋功能，旨在讓使用者分析不滿意的原因。根據分析結果，使用者可以相應地調整提示、RAG 資料來源和參數。

![](./imgs/feedback_loop.png)

![](./imgs/feedback-using-claude-chat.png)

資料分析師可以使用 [Amazon Athena](https://aws.amazon.com/jp/athena/) 存取對話記錄。如果他們想使用 [Jupyter Notebook](https://jupyter.org/) 進行資料分析，[此筆記本範例](../examples/notebooks/feedback_analysis_example.ipynb) 可以作為參考。

## 儀表板

目前提供聊天機器人和使用者使用情況的基本概述，著重於為每個機器人和使用者彙整指定時間段內的資料，並按使用費用排序結果。

![](./imgs/admin_bot_analytics.png)

## 備註

- 如[架構](../README.md#architecture)所述，管理功能將參考從 DynamoDB 匯出的 S3 儲存貯體。請注意，由於匯出每小時執行一次，最新的對話可能不會立即反映。

- 在公開機器人使用情況中，在指定期間內未被使用的機器人將不會被列出。

- 在使用者使用情況中，在指定期間內未使用系統的使用者將不會被列出。

> [!Important]
> 如果您使用多個環境（開發、正式等），Athena 資料庫名稱將包含環境前綴。不是 `bedrockchatstack_usage_analysis`，資料庫名稱將是：
>
> - 對於預設環境：`bedrockchatstack_usage_analysis`
> - 對於具名環境：`<env-prefix>_bedrockchatstack_usage_analysis`（例如 `dev_bedrockchatstack_usage_analysis`）
>
> 此外，資料表名稱也將包含環境前綴：
>
> - 對於預設環境：`ddb_export`
> - 對於具名環境：`<env-prefix>_ddb_export`（例如 `dev_ddb_export`）
>
> 在處理多個環境時，請務必相應地調整您的查詢。

## 下載對話資料

您可以使用 Athena 和 SQL 查詢對話日誌。要下載日誌，請從管理控制台開啟 Athena 查詢編輯器並運行 SQL。以下是一些有用於分析用例的範例查詢。反饋可以在 `MessageMap` 屬性中參考。

### 按 Bot ID 查詢

編輯 `bot-id` 和 `datehour`。`bot-id` 可以在 Bot 管理畫面上查看，該畫面可從左側邊欄的 Bot 發佈 API 訪問。注意 URL 末尾的部分，如 `https://xxxx.cloudfront.net/admin/bot/<bot-id>`。

```sql
SELECT
    d.newimage.PK.S AS UserId,
    d.newimage.SK.S AS ConversationId,
    d.newimage.MessageMap.S AS MessageMap,
    d.newimage.TotalPrice.N AS TotalPrice,
    d.newimage.CreateTime.N AS CreateTime,
    d.newimage.LastMessageId.S AS LastMessageId,
    d.newimage.BotId.S AS BotId,
    d.datehour AS DateHour
FROM
    bedrockchatstack_usage_analysis.ddb_export d
WHERE
    d.newimage.BotId.S = '<bot-id>'
    AND d.datehour BETWEEN '<yyyy/mm/dd/hh>' AND '<yyyy/mm/dd/hh>'
    AND d.Keys.SK.S LIKE CONCAT(d.Keys.PK.S, '#CONV#%')
ORDER BY
    d.datehour DESC;
```

> [!Note]
> 如果使用命名環境（例如 "dev"），請在上述查詢中將 `bedrockchatstack_usage_analysis.ddb_export` 替換為 `dev_bedrockchatstack_usage_analysis.dev_ddb_export`。

### 按 User ID 查詢

編輯 `user-id` 和 `datehour`。`user-id` 可以在 Bot 管理畫面上查看。

> [!Note]
> 用戶使用分析即將推出。

```sql
SELECT
    d.newimage.PK.S AS UserId,
    d.newimage.SK.S AS ConversationId,
    d.newimage.MessageMap.S AS MessageMap,
    d.newimage.TotalPrice.N AS TotalPrice,
    d.newimage.CreateTime.N AS CreateTime,
    d.newimage.LastMessageId.S AS LastMessageId,
    d.newimage.BotId.S AS BotId,
    d.datehour AS DateHour
FROM
    bedrockchatstack_usage_analysis.ddb_export d
WHERE
    d.newimage.PK.S = '<user-id>'
    AND d.datehour BETWEEN '<yyyy/mm/dd/hh>' AND '<yyyy/mm/dd/hh>'
    AND d.Keys.SK.S LIKE CONCAT(d.Keys.PK.S, '#CONV#%')
ORDER BY
    d.datehour DESC;
```

> [!Note]
> 如果使用命名環境（例如 "dev"），請在上述查詢中將 `bedrockchatstack_usage_analysis.ddb_export` 替換為 `dev_bedrockchatstack_usage_analysis.dev_ddb_export`。