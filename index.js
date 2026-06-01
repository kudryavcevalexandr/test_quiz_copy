import { AppRegistry } from 'react-native';
import * as FileSystem from 'expo-file-system';
import App from './App';

// Указываем путь в общую папку Documents на телефоне
const logFilePath = `${FileSystem.documentDirectory}../Documents/block_order_crash_logs.txt`;

const writeLog = async (message) => {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n\n`;

    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    if (fileInfo.exists) {
      const existingContent = await FileSystem.readAsStringAsync(logFilePath);
      await FileSystem.writeAsStringAsync(logFilePath, existingContent + logMessage);
    } else {
      await FileSystem.writeAsStringAsync(logFilePath, logMessage);
    }
  } catch (e) {
    // Если папка Documents недоступна напрямую, пишем в кэш, который виден проводникам:
    try {
      const fallbackPath = `${FileSystem.cacheDirectory}crash_logs.txt`;
      await FileSystem.writeAsStringAsync(fallbackPath, message);
    } catch (err) {}
  }
};

// Перехват критических ошибок
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  writeLog(`FATAL EXCEPTION: ${error.message}\nSTACK: ${error.stack}`);
  defaultErrorHandler(error, isFatal);
});

AppRegistry.registerComponent('blockordergame', () => App);
