# Seamless Splash Screen Implementation Guide

This guide explains how to implement a seamless splash screen in React Native that eliminates the awkward background color mismatch during app startup.

## The Problem

Many React Native apps show an awkward flash or color mismatch between the native splash screen and the React Native app background during startup. This happens because:
1. The native splash screen has one background color
2. React Native takes a moment to load and render
3. The React Native app container has a different background color
4. Users see a visible transition/flash between these colors

## The Solution

The key is ensuring **consistent background colors** across all layers:

### 1. Expo Configuration (app.json)
```json
{
  "expo": {
    "backgroundColor": "#2D2D2E",
    "splash": {
      "image": "./assets/icon.png",
      "resizeMode": "contain", 
      "backgroundColor": "#2B2D2E"
    }
  }
}
```

**Key points:**
- Set `backgroundColor` at the root level for the overall app
- Set `splash.backgroundColor` to match your main app theme
- Use `resizeMode: "contain"` to properly scale your splash image

### 2. React Native App Container (App.tsx)
```tsx
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Your app content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292929', // MUST match splash colors
  },
});
```

**Key points:**
- Set `backgroundColor` on the root container to match splash screen
- Use `flex: 1` to fill the entire screen

### 3. iOS Native Configuration

#### SplashScreen.storyboard
The iOS splash screen is configured via Interface Builder with:
- **Background Color**: Named color "SplashScreenBackground" 
- **Image**: "SplashScreenLogo" centered and scaled to fit
- **Constraints**: Image fills entire container

#### iOS Assets (Images.xcassets)

**SplashScreenBackground.colorset/Contents.json:**
```json
{
  "colors": [
    {
      "color": {
        "components": {
          "alpha": "1.000",
          "blue": "0.180392156862745",
          "green": "0.176470588235294", 
          "red": "0.168627450980392"
        },
        "color-space": "srgb"
      },
      "idiom": "universal"
    }
  ]
}
```

**SplashScreenLogo.imageset:** Contains @1x, @2x, @3x versions of splash logo

### 4. Android Configuration

#### styles.xml
```xml
<style name="Theme.App.SplashScreen" parent="AppTheme">
  <item name="android:windowBackground">@drawable/ic_launcher_background</item>
</style>
```

#### colors.xml
```xml
<resources>
  <color name="splashscreen_background">#292929</color>
</resources>
```

#### ic_launcher_background.xml
```xml
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background"/>
  <item>
    <bitmap android:gravity="center" android:src="@drawable/splashscreen_logo"/>
  </item>
</layer-list>
```

#### AndroidManifest.xml
```xml
<activity 
  android:name=".MainActivity"
  android:theme="@style/Theme.App.SplashScreen"
  android:exported="true">
```

## Step-by-Step Implementation

### For Expo Managed Workflow:

1. **Update app.json:**
   ```json
   {
     "expo": {
       "backgroundColor": "#YourAppColor",
       "splash": {
         "image": "./assets/splash-logo.png",
         "resizeMode": "contain",
         "backgroundColor": "#YourAppColor"
       }
     }
   }
   ```

2. **Update your root App component:**
   ```tsx
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#YourAppColor', // Same as splash
     },
   });
   ```

3. **Run prebuild to generate native code:**
   ```bash
   npx expo prebuild --clean
   ```

### For Expo Development Build:

If using a development build (like this app), the native splash screens are already configured. Just ensure your React Native colors match.

### Color Consistency Checklist:

- [ ] `app.json` → `expo.backgroundColor`
- [ ] `app.json` → `expo.splash.backgroundColor` 
- [ ] `App.tsx` → Root container `backgroundColor`
- [ ] iOS → `SplashScreenBackground` named color
- [ ] Android → `splashscreen_background` color resource

## Pro Tips

1. **Use a color picker** to ensure exact hex values match across all platforms
2. **Test on both platforms** - colors can render slightly differently
3. **Consider dark mode** - you may need different splash configurations
4. **Keep splash images simple** - complex images can cause loading delays
5. **Use development builds** for testing - Expo Go doesn't show custom splash screens

## Common Issues

- **Color mismatch**: Double-check all hex values are identical
- **Splash not showing**: Ensure image paths are correct in app.json
- **Flash during transition**: Make sure React Native container background matches
- **Build issues**: Run `npx expo prebuild --clean` after splash changes

This implementation creates a seamless user experience where the splash screen background perfectly matches your app, eliminating any jarring color transitions during startup.