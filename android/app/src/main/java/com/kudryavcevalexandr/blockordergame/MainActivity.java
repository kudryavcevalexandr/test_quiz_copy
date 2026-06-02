package com.kudryavcevalexandr.blockordergame;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends ReactActivity {
    private static final String CRASH_FILE_NAME = "native_crash.txt";
    private static final int CRASH_TOAST_DELAY_MS = 3500;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        installNativeCrashLogger();
        super.onCreate(savedInstanceState);
        showPreviousCrashMessageIfAny();
    }

    private File getCrashFile() {
        File crashDirectory = getExternalFilesDir(null);

        if (crashDirectory == null) {
            crashDirectory = getFilesDir();
        }

        return new File(crashDirectory, CRASH_FILE_NAME);
    }

    private void installNativeCrashLogger() {
        final Thread.UncaughtExceptionHandler previousHandler = Thread.getDefaultUncaughtExceptionHandler();

        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            File crashFile = getCrashFile();
            writeCrashToFile(crashFile, thread, throwable);
            showCrashToast("Приложение вылетело. Лог сохранён: " + crashFile.getAbsolutePath());
            waitForCrashToast();

            if (previousHandler != null) {
                previousHandler.uncaughtException(thread, throwable);
            } else {
                android.os.Process.killProcess(android.os.Process.myPid());
                System.exit(10);
            }
        });
    }

    private void writeCrashToFile(File crashFile, Thread thread, Throwable throwable) {
        File parentDirectory = crashFile.getParentFile();

        if (parentDirectory != null && !parentDirectory.exists()) {
            parentDirectory.mkdirs();
        }

        try (FileWriter fileWriter = new FileWriter(crashFile, false);
             PrintWriter printWriter = new PrintWriter(fileWriter)) {
            String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS Z", Locale.US).format(new Date());

            printWriter.println("Timestamp: " + timestamp);
            printWriter.println("Thread: " + thread.getName());
            printWriter.println("Message: " + throwable.getClass().getName() + ": " + throwable.getMessage());
            printWriter.println();
            throwable.printStackTrace(printWriter);
            printWriter.flush();
        } catch (IOException ignored) {
            // Avoid throwing from the crash handler itself.
        }
    }

    private void showPreviousCrashMessageIfAny() {
        File crashFile = getCrashFile();

        if (crashFile.exists() && crashFile.length() > 0) {
            showCrashToast("Найден лог прошлого вылета: " + crashFile.getAbsolutePath());
        }
    }

    private void showCrashToast(String message) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            Toast.makeText(getApplicationContext(), message, Toast.LENGTH_LONG).show();
            return;
        }

        new Handler(Looper.getMainLooper()).post(() ->
            Toast.makeText(getApplicationContext(), message, Toast.LENGTH_LONG).show());
    }

    private void waitForCrashToast() {
        try {
            Thread.sleep(CRASH_TOAST_DELAY_MS);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    @Override
    protected String getMainComponentName() {
        return "main";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }
}
