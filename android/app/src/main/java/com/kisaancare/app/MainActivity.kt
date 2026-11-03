package com.kisaancare.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar

    private var geolocationOrigin: String? = null
    private var geolocationCallback: GeolocationPermissions.Callback? = null

    // Multiple permissions launcher for Camera, Location, Microphone, Notifications
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val audioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false

        if (fineLocationGranted && geolocationCallback != null && geolocationOrigin != null) {
            geolocationCallback?.invoke(geolocationOrigin, true, true)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setTheme(R.style.Theme_KisaanCare)

        // Native layout setup with SwipeRefreshLayout and WebView
        val rootLayout = androidx.constraintlayout.widget.ConstraintLayout(this)
        rootLayout.layoutParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
            androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT,
            androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT
        )

        swipeRefresh = SwipeRefreshLayout(this)
        swipeRefresh.layoutParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
            androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT,
            androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT
        )
        swipeRefresh.setColorSchemeResources(R.color.primary_emerald, R.color.accent_amber)

        webView = WebView(this)
        webView.layoutParams = androidx.swiperefreshlayout.widget.SwipeRefreshLayout.LayoutParams(
            androidx.swiperefreshlayout.widget.SwipeRefreshLayout.LayoutParams.MATCH_PARENT,
            androidx.swiperefreshlayout.widget.SwipeRefreshLayout.LayoutParams.MATCH_PARENT
        )

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal)
        val progressParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
            androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.MATCH_PARENT,
            12
        )
        progressParams.topToTop = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
        progressBar.layoutParams = progressParams
        progressBar.progressDrawable = ContextCompat.getDrawable(this, android.R.drawable.progress_horizontal)
        progressBar.visibility = View.GONE

        swipeRefresh.addView(webView)
        rootLayout.addView(swipeRefresh)
        rootLayout.addView(progressBar)
        setContentView(rootLayout)

        configureWebView()
        checkAndRequestInitialPermissions()

        // Handle hardware back button navigation
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        // Swipe-down to refresh
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }

        // Determine launch URL (handle deep-links or default)
        val launchUrl = intent?.dataString ?: getString(R.string.default_web_url)
        webView.loadUrl(launchUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            useWideViewPort = true
            loadWithOverviewMode = true
            allowFileAccess = true
            allowContentAccess = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            mediaPlaybackRequiresUserGesture = false

            // Offline Caching & High-speed Performance
            cacheMode = if (isNetworkAvailable()) {
                WebSettings.LOAD_DEFAULT
            } else {
                WebSettings.LOAD_CACHE_ELSE_NETWORK
            }

            // User-agent identification for Android native experience
            userAgentString = "$userAgentString KisaanCareAndroidNative/1.0"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                val host = Uri.parse(url).host ?: ""

                // Keep app navigation internal to Kisaan Care domain
                if (host.contains("asia-southeast1.run.app") || host.contains("localhost")) {
                    return false
                }

                // External links (Govt portals, PM-Kisan, Mandi sites) open in external browser
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true && !isNetworkAvailable()) {
                    Toast.makeText(
                        this@MainActivity,
                        "ऑफ़लाइन मोड: सहेजा गया डेटा दिखाया जा रहा है (Offline Mode)",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar.progress = newProgress
                if (newProgress >= 100) {
                    progressBar.visibility = View.GONE
                }
            }

            // Handle browser geolocation permission request
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                geolocationOrigin = origin
                geolocationCallback = callback

                if (ContextCompat.checkSelfPermission(
                        this@MainActivity,
                        Manifest.permission.ACCESS_FINE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED
                ) {
                    callback?.invoke(origin, true, true)
                } else {
                    requestPermissionLauncher.launch(
                        arrayOf(
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                    )
                }
            }

            // Grant WebRTC microphone recording for AI Voice assistant
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.let {
                    if (ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.RECORD_AUDIO
                        ) == PackageManager.PERMISSION_GRANTED
                    ) {
                        it.grant(it.resources)
                    } else {
                        requestPermissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
                    }
                }
            }
        }
    }

    private fun checkAndRequestInitialPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
            permissionsToRequest.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }

        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetwork = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
