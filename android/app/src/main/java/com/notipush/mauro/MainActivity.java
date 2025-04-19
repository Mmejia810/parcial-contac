package com.notipush.mauro;

import android.content.pm.PackageManager;
import android.os.Build;
import com.mycompany.plugins.example.Example;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.Manifest;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onStart() {
    super.onStart();
    requestNotificationPermission();
  }

  private void requestNotificationPermission() {
    if (Build.VERSION.SDK_INT >= Build
      .VERSION_CODES.TIRAMISU) { // Android 13+
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
 }
}
}
}
