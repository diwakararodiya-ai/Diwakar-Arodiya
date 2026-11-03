# ProGuard configuration for Kisaan Care Android app
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keeppublic class * extends android.app.Activity
-keeppublic class * extends android.app.Application
-keeppublic class * extends android.app.Service
-keeppublic class * extends android.content.BroadcastReceiver
-keeppublic class * extends android.content.ContentProvider

# Android Browser Helper for TWA & Custom Tabs
-keep class com.google.androidbrowserhelper.** { *; }
-keep interface com.google.androidbrowserhelper.** { *; }
-dontwarn com.google.androidbrowserhelper.**

# Keep JavaScript Interface methods if used in WebViews
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
