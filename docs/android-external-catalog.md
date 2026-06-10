# Чтение `catalog.json` из общей папки Android

Функции `requestCatalogReadPermission` и `loadCatalogFromFile` находятся в
[`catalogFile.ts`](../catalogFile.ts). По умолчанию файл читается из
`RNFS.DownloadDirectoryPath/catalog.json`.

## AndroidManifest.xml

Добавьте разрешение в `android/app/src/main/AndroidManifest.xml` **перед**
элементом `<application>`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Нужен только на Android 12L (API 32) и ниже. -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <application ...>
        ...
    </application>
</manifest>
```

Не добавляйте `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` или `READ_MEDIA_AUDIO`:
они не дают доступа к JSON. `WRITE_EXTERNAL_STORAGE` для чтения также не нужен.
Разрешение `MANAGE_EXTERNAL_STORAGE` предназначено только для узких категорий
файловых менеджеров и обычно не подходит приложениям, публикуемым в Google Play.

## Важные ограничения scoped storage

- Android 6-9 (API 23-28): после выдачи `READ_EXTERNAL_STORAGE` приложение может
  читать файл по прямому пути.
- Android 10 (API 29): для старой модели прямых путей можно временно задать
  `android:requestLegacyExternalStorage="true"` у `<application>`, но этот флаг
  работает только для приложений с `targetSdkVersion` 29 и ниже.
- Android 11-12L (API 30-32): одного `READ_EXTERNAL_STORAGE` недостаточно для
  произвольного файла в общей папке, если приложение использует современный
  target SDK. Прямой путь сработает только для файлов, доступных приложению по
  правилам scoped storage.
- Android 13+ (API 33+): runtime-разрешения для чтения произвольного JSON нет.
  Для надежного выбора пользовательского файла из Downloads/Documents нужен
  Android Storage Access Framework (например, нативный `ACTION_OPEN_DOCUMENT`).
  `react-native-fs` сам по себе не открывает SAF URI произвольного файла.

Таким образом, `loadCatalogFromFile` корректно обрабатывает прямой путь и
возвращает `null`, если Android запретил доступ. Для поддержки любого выбранного
пользователем `catalog.json` на современных Android дополните приложение
нативным picker-модулем на базе Storage Access Framework.

## Использование

```ts
import { loadCatalogFromFile } from './catalogFile';

const catalog = await loadCatalogFromFile();

if (catalog === null) {
  // Покажите пользователю сообщение или предложите выбрать файл через SAF.
}
```

Для попытки чтения из Documents можно передать абсолютный путь явно:

```ts
import RNFS from 'react-native-fs';
import { loadCatalogFromFile } from './catalogFile';

const catalog = await loadCatalogFromFile(
  `${RNFS.ExternalStorageDirectoryPath}/Documents/catalog.json`,
);
```
