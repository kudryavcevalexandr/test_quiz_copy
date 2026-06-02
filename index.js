import { AppRegistry, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';

const CRASH_KEY = '@block_order_game_crash_log';

// 1. Глобальный перехватчик критических ошибок JS
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  const errorInfo = JSON.stringify({
    message: error.message,
    stack: error.stack,
    time: new Date().toISOString(),
  });

  // Локальное хранилище Android работает через SQLite/файлы нативно,
  // поэтому AsyncStorage успевает записать строку в базу до закрытия процесса.
  AsyncStorage.setItem(CRASH_KEY, errorInfo)
    .then(() => {
      // Вызываем стандартное закрытие приложения
      defaultErrorHandler(error, isFatal);
    })
    .catch(() => {
      defaultErrorHandler(error, isFatal);
    });
});

// 2. Проверка ошибки при следующем (новом) запуске приложения
const checkCrashLog = async () => {
  try {
    const savedLog = await AsyncStorage.getItem(CRASH_KEY);
    if (savedLog) {
      const parsed = JSON.parse(savedLog);

      // Выводим ошибку на экран в Alert
      Alert.alert(
        '🚨 Лог критического падения:',
        `Время: ${parsed.time}\n\nОшибка: ${parsed.message}\n\nСтек:\n${parsed.stack.slice(0, 600)}`,
        [
          {
            text: 'Очистить и закрыть',
            onPress: () => AsyncStorage.removeItem(CRASH_KEY),
          },
        ]
      );
    }
  } catch (e) {
    // Ошибка чтения из хранилища
  }
};

// Запускаем проверку через 2 секунды после старта интерфейса
setTimeout(checkCrashLog, 2000);

AppRegistry.registerComponent('blockordergame', () => App);
