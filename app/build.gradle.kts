plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.aistudio.venusbeachhouse"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.aistudio.venusbeachhouse"
        minSdk = 26
        targetSdk = 35
        versionCode = 220
        versionName = "2.2.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
        val bookingUrl = (project.findProperty("VENUS_BOOKING_URL") as String?) ?: System.getenv("VENUS_BOOKING_URL") ?: ""
        val guideHash = (project.findProperty("VENUS_GUIDE_SHA256") as String?) ?: System.getenv("VENUS_GUIDE_SHA256") ?: ""
        buildConfigField("String", "BOOKING_URL", "\"${bookingUrl.replace("\\", "\\\\").replace("\"", "\\\"")}\"")
        buildConfigField("String", "GUIDE_EXPECTED_SHA256", "\"${guideHash.replace("\\", "\\\\").replace("\"", "\\\"")}\"")
    }

    signingConfigs {
        val storePath = System.getenv("VENUS_KEYSTORE_PATH")
        val storePasswordEnv = System.getenv("VENUS_KEYSTORE_PASSWORD")
        val aliasEnv = System.getenv("VENUS_KEY_ALIAS")
        val keyPasswordEnv = System.getenv("VENUS_KEY_PASSWORD")
        if (!storePath.isNullOrBlank() && !storePasswordEnv.isNullOrBlank() && !aliasEnv.isNullOrBlank() && !keyPasswordEnv.isNullOrBlank()) {
            create("release") {
                storeFile = file(storePath)
                storePassword = storePasswordEnv
                keyAlias = aliasEnv
                keyPassword = keyPasswordEnv
            }
        }
    }

    buildTypes {
        debug { isMinifyEnabled = false }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            signingConfig = signingConfigs.findByName("release")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true; buildConfig = true }
    packaging { resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" } }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.coil.compose)
    implementation(libs.kotlinx.coroutines.android)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
