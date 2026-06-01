import { AppRegistry } from 'react-native';
import * as FileSystem from 'expo-file-system';
import App from './App';

// Путь к файлу логов в памяти телефона
const logFilePath = `${FileSystem.documentDirectory}crash_logs.txt`;

// Функция для записи лога
const writeLog = async (message) => {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n\n`;

    // Проверяем, есть ли уже файл
    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    if (fileInfo.exists) {
      const existingContent = await FileSystem.readAsStringAsync(logFilePath);
      await FileSystem.writeAsStringAsync(logFilePath, existingContent + logMessage);
    } else {
      await FileSystem.writeAsStringAsync(logFilePath, logMessage);
    }
  } catch (e) {
    // Внутренняя ошибка записи лога, ее негде сохранить
  }
};

// Перехватываем глобальные ошибки JS (вылеты)
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  const errorInfo = `FATAL EXCEPTION: ${error.message}\nSTACK: ${error.stack}`;

  // Синхронно вызвать запись не выйдет, но мы пушим в фоновый поток перед падением
  writeLog(errorInfo);

  // Возвращаем стандартное поведение, чтобы приложение закрылось как обычно
  defaultErrorHandler(error, isFatal);
});

// Перехватываем обычные console.error, если прила не упала, но сбоит
const originalConsoleError = console.error;
console.error = (...args) => {
  writeLog(`CONSOLE ERROR: ${args.join(' ')}`);
  originalConsoleError(...args);
};

AppRegistry.registerComponent('blockordergame', () => App);
