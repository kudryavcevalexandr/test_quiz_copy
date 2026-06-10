import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import type { Category } from './types';

const CATALOG_FILE_NAME = 'catalog.json';

/**
 * Requests the legacy storage permission required to read a JSON file by its
 * absolute path on Android 6-12 (API 23-32).
 *
 * Android 13+ has no runtime permission for arbitrary JSON files. The media
 * permissions introduced in API 33 do not apply to JSON, so direct-path access
 * succeeds there only when Android's scoped-storage rules already allow it.
 */
export async function requestCatalogReadPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const apiLevel = Number(Platform.Version);

  if (apiLevel < 23) {
    return true;
  }

  if (apiLevel >= 33) {
    console.log(
      '[catalog] Android 13+ does not provide a runtime permission for arbitrary JSON files. ' +
        'If direct access fails, let the user select catalog.json through the Storage Access Framework.',
    );
    return true;
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Доступ к каталогу',
        message: 'Приложению нужен доступ к catalog.json в папке Downloads.',
        buttonPositive: 'Разрешить',
        buttonNegative: 'Отмена',
      },
    );

    const granted = result === PermissionsAndroid.RESULTS.GRANTED;

    if (!granted) {
      console.log(`[catalog] Доступ к хранилищу не предоставлен: ${result}.`);
    }

    return granted;
  } catch (error) {
    console.log('[catalog] Не удалось запросить доступ к хранилищу.', error);
    return false;
  }
}

function isCategory(value: unknown): value is Category {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const category = value as Partial<Category>;

  return (
    typeof category.id === 'string' &&
    typeof category.title === 'string' &&
    Array.isArray(category.items) &&
    category.items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string',
    )
  );
}

/**
 * Reads Downloads/catalog.json at runtime. Pass another absolute path to read,
 * for example, a directly accessible file from Documents instead.
 */
export async function loadCatalogFromFile(
  filePath = `${RNFS.DownloadDirectoryPath}/${CATALOG_FILE_NAME}`,
): Promise<Category[] | null> {
  try {
    const hasPermission = await requestCatalogReadPermission();

    if (!hasPermission) {
      console.log(`[catalog] Нет разрешения на чтение файла: ${filePath}`);
      return null;
    }

    const exists = await RNFS.exists(filePath);

    if (!exists) {
      console.log(`[catalog] Файл не найден: ${filePath}`);
      return null;
    }

    const contents = await RNFS.readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(contents);

    if (!Array.isArray(parsed) || !parsed.every(isCategory)) {
      console.log('[catalog] catalog.json имеет неверную структуру: ожидался массив категорий.');
      return null;
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log('[catalog] catalog.json содержит поврежденный JSON.', error);
    } else {
      console.log('[catalog] Не удалось прочитать catalog.json. Проверьте путь и права доступа.', error);
    }

    return null;
  }
}
