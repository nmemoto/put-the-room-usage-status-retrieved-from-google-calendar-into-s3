# show-google-calendar-with-aws-lambda

CloudWatch Event によって駆動された Lambda が任意のユーザー・会議室の google calendar の実行日のみの予定を取得し、CloudWatch Logs に5分毎のその1日の予定の埋まり具合(埋まっている: 1, 埋まっていない: 0)をCSVで出力する

## 準備するもの

GCPのサービスアカウント

- ユーザーに紐付かないアプリケーションから任意の Google Calendar にアクセスするにはサービスアカウントが必要なため、これを用意すること。

- このサービスアカウントに紐づくメールアドレス(\*@\*.iam.gserviceaccount.com)を予め取得したいユーザーの予定表に共有設定を施す必要がある。

- サービスアカウントの秘密鍵を`credentials.json`としてプロジェクト直下に格納する必要がある

取得したいユーザーのカレンダーID

- 取得したいユーザーの「設定と共有」> 「カレンダーの設定」 > 「カレンダーの統合」の下にカレンダーIDが記載されている

- 以下のようにカレンダーIDとその名前のオブジェクトを配列形式で`cdk.context.json`として記載する

```json
{
    "calendarList": [
        {
            "name": "test",
            "calendarId": "*@gmail.com"
        },
        {
            "name": "会議室1",
            "calendarId": "*@resource.calendar.google.com"
        }
    ]
}
```

## デプロイ

`credentails.json`と`cdk.context.json`を用意して以下のコマンドを実行する

```shell
cdk deploy
```
