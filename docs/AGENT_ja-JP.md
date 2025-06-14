# LLM を活用したエージェント (ReAct)

## エージェント（ReAct）とは

エージェントは、大規模言語モデル（LLM）を中心的な計算エンジンとして利用する高度なAIシステムです。LLMの推論能力を、計画立案やツール使用などの追加機能と組み合わせ、複雑なタスクを自律的に実行します。エージェントは、複雑な問い合わせを分解し、ステップバイステップのソリューションを生成し、情報収集やサブタスク実行のために外部ツールやAPIと対話できます。

このサンプルは、[ReAct（Reasoning + Acting）](https://www.promptingguide.ai/techniques/react)アプローチを使用してエージェントを実装しています。ReActにより、エージェントは推論とアクションを反復的なフィードバックループで組み合わせて、複雑なタスクを解決できます。エージェントは、思考、アクション、観察の3つの重要なステップを繰り返し実行します。LLMを使用して現在の状況を分析し、次に取るべきアクションを決定し、利用可能なツールやAPIを使用してアクションを実行し、観察結果から学習します。この継続的なプロセスにより、エージェントは動的な環境に適応し、タスク解決の精度を向上させ、コンテキストを意識したソリューションを提供できます。

## 使用例

ReAct を使用するエージェントは、さまざまなシナリオで正確かつ効率的なソリューションを提供できます。

### テキストからSQL

ユーザーが「前四半期の総売上」を尋ねると、エージェントはこのリクエストを解釈し、SQLクエリに変換し、データベースに対して実行し、結果を提示します。

### 財務予測

財務アナリストが次四半期の収益を予測する必要がある場合、エージェントは関連するデータを収集し、財務モデルを使用して必要な計算を実行し、予測の正確性を確保しながら詳細な予測レポートを生成します。

## エージェント機能の使用方法

カスタマイズしたチャットボットのエージェント機能を有効にするには、以下の手順に従ってください：

エージェント機能を使用する方法は2つあります：

### ツール使用の利用

カスタマイズしたチャットボットでツール使用によるエージェント機能を有効にするには、以下の手順に従ってください：

1. カスタムボット画面のエージェントセクションに移動します。

2. エージェントセクションで、エージェントが使用できるツールのリストが表示されます。デフォルトでは、すべてのツールは無効になっています。

3. ツールを有効にするには、目的のツールの横にあるスイッチを切り替えるだけです。ツールが有効になると、エージェントはそれにアクセスし、ユーザークエリの処理に利用できます。

![](./imgs/agent_tools.png)

4. 例えば、「インターネット検索」ツールを使用すると、エージェントはインターネットから情報を取得してユーザーの質問に答えることができます。

![](./imgs/agent1.png)
![](./imgs/agent2.png)

5. エージェントの機能を拡張するために、独自のカスタムツールを開発して追加することができます。カスタムツールの作成と統合の詳細については、[独自のツールの開発方法](#how-to-develop-your-own-tools)セクションを参照してください。

### Bedrock Agentの使用

Amazon Bedrockで作成された[Bedrock Agent](https://aws.amazon.com/bedrock/agents/)を利用できます。

まず、Bedrock（例：管理コンソール経由）でエージェントを作成します。次に、カスタムボット設定画面でエージェントIDを指定します。設定すると、チャットボットはBedrock Agentを活用してユーザークエリを処理します。

![](./imgs/bedrock_agent_tool.png)

## 独自のツールを開発する方法

エージェント用の独自のカスタムツールを開発するには、以下のガイドラインに従ってください：

- `AgentTool` クラスを継承する新しいクラスを作成します。インターフェースは LangChain と互換性がありますが、このサンプル実装では独自の `AgentTool` クラスを提供しており、そこから継承する必要があります（[ソース](../backend/app/agents/tools/agent_tool.py)）。

- [BMI 計算ツール](../examples/agents/tools/bmi/bmi.py)のサンプル実装を参照してください。この例では、ユーザー入力に基づいてボディマス指数（BMI）を計算するツールの作成方法を示しています。

  - ツールで宣言された名前と説明は、LLM がユーザーの質問に応答するためにどのツールを使用すべきかを検討する際に使用されます。つまり、LLM を呼び出すプロンプトに埋め込まれます。そのため、できるだけ正確に記述することをお勧めします。

- [オプション] カスタムツールを実装したら、テストスクリプト（[例](../examples/agents/tools/bmi/test_bmi.py)）を使用してその機能を確認することをお勧めします。このスクリプトは、ツールが期待通りに動作していることを確認するのに役立ちます。

- カスタムツールの開発とテストが完了したら、実装ファイルを [backend/app/agents/tools/](../backend/app/agents/tools/) ディレクトリに移動します。次に、[backend/app/agents/utils.py](../backend/app/agents/utils.py) を開き、`get_available_tools` を編集して、ユーザーが開発したツールを選択できるようにします。

- [オプション] フロントエンド用に明確な名前と説明を追加します。このステップはオプションですが、このステップを実行しない場合、ツールで宣言された名前と説明が使用されます。これらは LLM 用のものであり、ユーザー向けではないため、より良いUXのために専用の説明を追加することをお勧めします。

  - i18n ファイルを編集します。[en/index.ts](../frontend/src/i18n/en/index.ts) を開き、`agent.tools` に独自の `name` と `description` を追加します。
  - `xx/index.ts` も同様に編集します。`xx` は希望の国コードを表します。

- `npx cdk deploy` を実行して変更をデプロイします。これにより、カスタムツールがカスタムボット画面で利用可能になります。

## 貢献

**ツールリポジトリへの貢献を歓迎しています！** 有用で適切に実装されたツールを開発した場合、Issue またはプルリクエストを提出してプロジェクトに貢献することを検討してください。