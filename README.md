# タックル実績帳

前回釣れたセットを次回も再利用するための、個人用タックル実績帳PWAです。

## 公開方法

このリポジトリは静的ファイルだけで動きます。Vercel または GitHub Pages で公開できます。

### Vercel

1. VercelでこのリポジトリをImportします。
2. Framework Presetは `Other` のままで構いません。
3. Build Commandは空欄、Output Directoryも空欄または `.` にします。
4. Deploy後、発行されたHTTPS URLをiPhone Safariで開きます。

#### Vercel公開前チェック

1. GitHubに `index.html`、`app.js`、`styles.css`、`manifest.webmanifest`、`sw.js`、`icons/`、`.nojekyll`、`vercel.json` が含まれていることを確認します。
2. VercelのProject SettingsでRoot Directoryはリポジトリ直下のままにします。
3. Build Commandは未設定、Install Commandも未設定で問題ありません。
4. Output Directoryは未設定または `.` にします。
5. Deploy後のURLが `https://` で始まることを確認します。Service WorkerはHTTPS上で有効になります。
6. 公開URLでアプリを一度開いてから、iPhone Safariの共有メニューで `ホーム画面に追加` を行います。
7. ホーム画面のアイコンから起動し、アプリ名が `実績帳` または `タックル実績帳` と表示されることを確認します。
8. 一度オンラインで起動した後、機内モードで再起動し、ホーム画面が表示できることを確認します。
9. 釣果を1件保存し、ブラウザまたはホーム画面アプリを閉じて再起動しても保存データが残ることを確認します。

### GitHub Pages

1. GitHubのリポジトリ設定を開きます。
2. `Settings > Pages` を開きます。
3. Sourceを `Deploy from a branch` にします。
4. Branchを `main`、Folderを `/root` にします。
5. 公開URLをiPhone Safariで開きます。

## iPhoneでホーム画面に追加する

1. iPhone Safariで公開URLを開きます。
2. 共有ボタンを押します。
3. `ホーム画面に追加` を選びます。
4. 名前が `タックル実績帳` になっていることを確認します。
5. `追加` を押します。
6. ホーム画面のアイコンから起動します。

## オフライン確認

1. 一度オンラインでアプリを開きます。
2. ホーム画面に追加したアイコンから起動します。
3. iPhoneを機内モードにします。
4. もう一度ホーム画面のアイコンから起動します。
5. ホーム、今日のセット、釣果追加、実績が表示できればオフライン起動は成功です。

## PWA構成

- `index.html`: PWAメタタグ、Apple touch icon、manifest読み込み
- `manifest.webmanifest`: アプリ名、起動URL、アイコン、縦向き指定
- `sw.js`: 静的ファイルとアイコンをキャッシュし、オフライン起動を補助
- `icons/`: ホーム画面用アイコン

## 現在の制約

- データ保存はブラウザのローカル保存です。
- クラウド同期、ログイン、課金、GPS、地図、天候、SNSは未対応です。
- iPhone SafariではService Workerが初回表示後に有効になるため、オフライン確認は一度オンラインで開いた後に行ってください。
