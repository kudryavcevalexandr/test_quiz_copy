package com.kudryavcevalexandr.blockordergame;

import android.os.Bundle;

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
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        installNativeCrashLogger();
        super.onCreate(savedInstanceState);
    }

    private void installNativeCrashLogger() {
        final Thread.UncaughtExceptionHandler previousHandler = Thread.getDefaultUncaughtExceptionHandler();

        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            File crashFile = new File(getFilesDir(), "native_crash.txt");

            try (FileWriter fileWriter = new FileWriter(crashFile, false);
                 PrintWriter printWriter = new PrintWriter(fileWriter)) {
                String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS Z", Locale.US).format(new Date());

                printWriter.println("Timestamp: " + timestamp);
                printWriter.println("Thread: " + thread.getName());
                printWriter.println();
                throwable.printStackTrace(printWriter);
                printWriter.flush();
            } catch (IOException ignored) {
                // Avoid throwing from the crash handler itself.
            }

            if (previousHandler != null) {
                previousHandler.uncaughtException(thread, throwable);
            } else {
                android.os.Process.killProcess(android.os.Process.myPid());
                System.exit(10);
            }
        });
    }

    @Override
    protected String getMainComponentName() {
        return "blockordergame";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }
}
