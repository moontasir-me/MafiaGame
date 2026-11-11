package com.shoyaeb.mafia;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.IOException;

/** Offline assets served under a secure origin so Web Crypto is available. */
public class MainActivity extends Activity {
    private WebView webView;
    private static final String HOST = "appassets.androidplatform.net";

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(20,34,29));
        webView.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.addJavascriptInterface(new PrivacyBridge(), "Android");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !HOST.equals(request.getUrl().getHost());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String file = uri.getPath();
                if (!HOST.equals(uri.getHost()) || file == null || file.contains("..")) return empty();
                file = file.equals("/") ? "index.html" : file.substring(1);
                String mime = file.endsWith(".html") ? "text/html" : file.endsWith(".css") ? "text/css" :
                        (file.endsWith(".js") || file.endsWith(".mjs")) ? "text/javascript" :
                        file.endsWith(".png") ? "image/png" : file.endsWith(".svg") ? "image/svg+xml" : "application/json";
                try { return new WebResourceResponse(mime, "UTF-8", getAssets().open(file)); }
                catch (IOException e) { return empty(); }
            }
        });
        setContentView(webView);
        // Keep Android 15 edge-to-edge content clear of status/navigation bars.
        webView.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        webView.loadUrl("https://" + HOST + "/index.html");
    }
    private WebResourceResponse empty() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new ByteArrayInputStream(new byte[0]));
    }
    public class PrivacyBridge {
        @JavascriptInterface public void setTheme(String theme) {
            runOnUiThread(() -> {
                boolean light = "light".equals(theme);
                int color = light ? Color.rgb(252,245,231) : Color.rgb(20,34,29);
                webView.setBackgroundColor(color);
                getWindow().setStatusBarColor(color);
                getWindow().setNavigationBarColor(color);
                getWindow().getDecorView().setSystemUiVisibility(light ?
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0);
            });
        }
        // Secure is intentionally always on: also protects the recent-app preview.
        @JavascriptInterface public void setSecure(boolean secure) { }
        @JavascriptInterface public void setPlaying(boolean playing) {
            runOnUiThread(() -> {
                if (playing) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }
    }
    @Override protected void onPause() {
        webView.evaluateJavascript("window.onNativePause && window.onNativePause()", null);
        super.onPause();
    }
    @Override public void onBackPressed() {
        webView.evaluateJavascript("window.onNativeBack && window.onNativeBack()", null);
    }
    @Override protected void onDestroy() {
        webView.removeJavascriptInterface("Android"); webView.destroy(); super.onDestroy();
    }
}
