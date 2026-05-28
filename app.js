/**
 * Webtoon Auto-Scroller Floating Controller & Simulator
 * Core JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const phoneScreen = document.getElementById('phoneScreen');
    const webtoonViewer = document.getElementById('webtoonViewer');
    const webtoonAppTitle = document.getElementById('webtoonAppTitle');
    
    // Floating Widget
    const floatingWidget = document.getElementById('floatingWidget');
    const widgetDragHandle = document.getElementById('widgetDragHandle');
    const playBtn = document.getElementById('playBtn');
    const speedVal = document.getElementById('speedVal');
    const scrollSpeed = document.getElementById('scrollSpeed');
    const togglePanelBtn = document.getElementById('togglePanelBtn');
    const toggleIcon = document.getElementById('toggleIcon');
    const widgetSliderPanel = document.getElementById('widgetSliderPanel');

    // Controls Panel
    const genreCards = document.querySelectorAll('.genre-card');
    const widgetOpacity = document.getElementById('widgetOpacity');
    const opacityVal = document.getElementById('opacityVal');
    const colorPickerBtns = document.querySelectorAll('.color-picker-btn');
    const btnResetWidget = document.getElementById('btnResetWidget');
    const resetScrollBtn = document.getElementById('resetScrollBtn');
    
    // Code tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const codeFileSelect = document.getElementById('codeFileSelect');
    const codeDisplay = document.getElementById('codeDisplay');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const toast = document.getElementById('toast');

    // Phone Status Clock
    const statusTime = document.getElementById('statusTime');

    // === GLOBAL STATES ===
    let isPlaying = false;
    let currentSpeed = parseFloat(scrollSpeed.value); // Multiplier
    let scrollAnimId = null;
    let isWidgetExpanded = false;
    
    // Widget Dragging Coordinates
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let widgetLeft = 0;
    let widgetTop = 0;

    // === 1. CLOCK UPDATE ===
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        statusTime.textContent = `${hours}:${minutes}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // === 2. WEBTOON CONTENT GENERATOR ===
    const webtoonData = {
        title: "Webtoon Auto-Scroller",
        themeColor: "#3b82f6",
        panels: [
            { type: 'header', title: "Webtoon Scroller", sub: "자동 스크롤러 시연 및 가이드" },
            { type: 'scene', text: "본 화면은 모바일 브라우저 및 안드로이드 앱의 오버레이 컨트롤러 동작을 미리 체험해 볼 수 있는 시뮬레이터입니다." },
            { type: 'scene', text: "재생 버튼(▶)을 누르면 이 화면 전체가 부드럽게 자동으로 아래로 스크롤됩니다." },
            { type: 'bubble', direction: 'left', text: "우와! 재생 버튼을 누르니까 글자가 엄청 부드럽게 위로 올라가네요!" },
            { type: 'bubble', direction: 'right', text: "그렇죠? 오른쪽 화살표(◀)를 눌러서 슬라이더로 속도 조절도 바로 해 보세요!" },
            { type: 'narrative', text: "💡 핵심 기술 스펙 및 탑재 기능" },
            { type: 'tech-card', title: "🚀 requestAnimationFrame 기반 고효율 스크롤", text: "기존의 불안정하고 뚝뚝 끊기는 setInterval 방식이 아닌, 브라우저 주사율에 완벽히 동기화된 초정밀 프레임 연산을 제공하여 모바일 120Hz 화면에서도 물 흐르듯 부드러운 스크롤을 보여줍니다." },
            { type: 'tech-card', title: "💎 아크릴 글래스모피즘 반투명 UI", text: "웹툰 그림을 최대한 가리지 않는 감각적인 유리를 형상화한 반투명 플로팅 오버레이 뷰입니다. 스크롤러 동작 중 3초 동안 어떠한 조작도 감지되지 않으면 투명도가 자동으로 감쇠(Dimming)되어 감상에 몰입하게 돕습니다." },
            { type: 'tech-card', title: "📏 원터치 크기 조절 시스템 (S / M / L)", text: "사용자의 손가락 크기나 기기 해상도에 맞춰 위젯에 장착된 크기 버튼만 누르면 0.8x(S), 1.0x(M), 1.2x(L) 배율로 위젯이 즉시 부드럽게 스케일링됩니다." },
            { type: 'tech-card', title: "⏱️ 초정밀 0.2x ~ 6.0x 속도 스펙", text: "슬라이더를 잡고 드래그하면 0.1 배율 단위의 극세사 스크롤 속도 설정이 가능합니다. PC 환경에서는 키보드 방향키(Up/Down)로도 미세 스피드 세팅이 가능합니다." },
            { type: 'tech-card', title: "🤖 안드로이드 네이티브 서비스 통합 지원", text: "구글 크롬 확장 프로그램뿐만 아니라, 안드로이드 접근성 서비스(AccessibilityService)와 SYSTEM_ALERT_WINDOW 권한을 사용하여 네이버 웹툰 앱 위에서 오버레이 형태로 제스처를 자동 주입해 줍니다." },
            { type: 'bubble', direction: 'left', text: "이 프로그램을 실제 브라우저나 스마트폰에서 쓰고 싶어요!" },
            { type: 'bubble', direction: 'right', text: "상단의 [앱 다운로드 센터] 탭을 눌러 설치 패키지를 원클릭으로 직접 다운로드하세요!" },
            { type: 'narrative', text: "스크롤과 함께 최고의 웹툰 독서 환경을 지금 미리 체험하세요." }
        ]
    };

    function renderWebtoon() {
        const data = webtoonData;
        webtoonAppTitle.textContent = data.title;
        webtoonViewer.innerHTML = ''; // Clear loading

        const container = document.createElement('div');
        container.className = 'wt-container';
        container.style.padding = '15px 10px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';
        container.style.alignItems = 'center';

        data.panels.forEach(panel => {
            const el = document.createElement('div');
            el.style.width = '100%';
            
            if (panel.type === 'header') {
                el.style.background = 'linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%)';
                el.style.padding = '25px 15px';
                el.style.textAlign = 'center';
                el.style.borderRadius = '12px';
                el.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                
                const t = document.createElement('div');
                t.style.fontSize = '1.3rem';
                t.style.fontWeight = '800';
                t.style.color = '#3b82f6';
                t.textContent = panel.title;

                const s = document.createElement('div');
                s.style.fontSize = '0.68rem';
                s.style.color = '#94a3b8';
                s.style.marginTop = '6px';
                s.textContent = panel.sub;

                el.appendChild(t);
                el.appendChild(s);
            } 
            else if (panel.type === 'scene') {
                el.style.padding = '0 10px';
                el.innerHTML = `<p style="font-size:0.75rem; text-align:center; color:#94a3b8; line-height:1.45; word-break:keep-all;">${panel.text}</p>`;
            }
            else if (panel.type === 'bubble') {
                el.style.display = 'flex';
                el.style.justifyContent = panel.direction === 'left' ? 'flex-start' : 'flex-end';
                
                const bubble = document.createElement('div');
                bubble.style.background = panel.direction === 'left' ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.1)';
                bubble.style.color = '#f8fafc';
                bubble.style.border = panel.direction === 'left' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59,130,246,0.2)';
                bubble.style.borderRadius = '16px';
                bubble.style.padding = '10px 14px';
                bubble.style.fontSize = '0.72rem';
                bubble.style.lineHeight = '1.4';
                bubble.style.maxWidth = '80%';
                bubble.style.wordBreak = 'keep-all';
                bubble.textContent = panel.text;
                
                el.appendChild(bubble);
            }
            else if (panel.type === 'narrative') {
                el.innerHTML = `<p style="font-size:0.72rem; color:#60a5fa; font-weight:700; text-align:center; margin: 10px 0;">${panel.text}</p>`;
            }
            else if (panel.type === 'tech-card') {
                const card = document.createElement('div');
                card.className = 'wt-tech-card';
                card.innerHTML = `
                    <h4>${panel.title}</h4>
                    <p>${panel.text}</p>
                `;
                el.appendChild(card);
            }

            container.appendChild(el);
        });

        webtoonViewer.appendChild(container);
    }

    // Default Render
    renderWebtoon();

    // === 3. FLOATING WIDGET DRAG LOGIC ===
    
    // Set initial position centered relative to Phone Viewport
    function resetWidgetPosition() {
        const screenWidth = phoneScreen.clientWidth;
        const screenHeight = phoneScreen.clientHeight;
        const widgetWidth = floatingWidget.clientWidth;
        const widgetHeight = floatingWidget.clientHeight;

        widgetLeft = (screenWidth - widgetWidth) / 2;
        widgetTop = (screenHeight - widgetHeight) / 2;

        floatingWidget.style.left = `${widgetLeft}px`;
        floatingWidget.style.top = `${widgetTop}px`;
        floatingWidget.style.right = 'auto';
        floatingWidget.style.bottom = 'auto';
    }

    // Run reset once browser computes width/height
    setTimeout(resetWidgetPosition, 100);

    // Drag events
    widgetDragHandle.addEventListener('mousedown', startDrag);
    widgetDragHandle.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        isDragging = true;
        
        // Handle mobile touch vs desktop click
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        const widgetRect = floatingWidget.getBoundingClientRect();
        const screenRect = phoneScreen.getBoundingClientRect();

        // Offset inside the widget
        dragStartX = clientX - widgetRect.left;
        dragStartY = clientY - widgetRect.top;

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);

        e.preventDefault();
    }

    function handleDrag(e) {
        if (!isDragging) return;

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const screenRect = phoneScreen.getBoundingClientRect();

        // New relative coordinates inside the phone screen
        let x = clientX - screenRect.left - dragStartX;
        let y = clientY - screenRect.top - dragStartY;

        // Constraints
        const maxLeft = phoneScreen.clientWidth - floatingWidget.clientWidth;
        const maxTop = phoneScreen.clientHeight - floatingWidget.clientHeight;

        // Force stay inside phone boundary
        if (x < 4) x = 4;
        if (x > maxLeft - 4) x = maxLeft - 4;
        if (y < 40) y = 40; // Avoid top camera / status bar
        if (y > maxTop - 30) y = maxTop - 30; // Avoid bottom navigation bar

        widgetLeft = x;
        widgetTop = y;

        floatingWidget.style.left = `${widgetLeft}px`;
        floatingWidget.style.top = `${widgetTop}px`;

        e.preventDefault();
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    // === 4. SMOOTH AUTO-SCROLL LOOP ===
    function autoScrollLoop() {
        if (!isPlaying) return;

        // Calculate scroll delta based on multiplier speed
        // 1.5x speed translates to ~1.2 pixels per frame
        const delta = currentSpeed * 0.8;
        
        const prevTop = webtoonViewer.scrollTop;
        webtoonViewer.scrollTop += delta;

        // If it stopped moving (reached bottom), pause
        if (webtoonViewer.scrollTop === prevTop && prevTop > 0) {
            isPlaying = false;
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            showToast("웹툰 끝까지 다 보셨습니다! 리셋합니다.");
        } else {
            scrollAnimId = requestAnimationFrame(autoScrollLoop);
        }
    }

    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;

        if (isPlaying) {
            playBtn.classList.add('playing');
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            autoScrollLoop();
        } else {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
        }
    });

    // Speed slider adjustment
    scrollSpeed.addEventListener('input', (e) => {
        currentSpeed = parseFloat(e.target.value);
        speedVal.textContent = `${currentSpeed.toFixed(1)}x`;
    });

    // Reset scroller button
    resetScrollBtn.addEventListener('click', () => {
        webtoonViewer.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === 5. COLLAPSIBLE SLIDER PANEL TOGGLE ===
    togglePanelBtn.addEventListener('click', () => {
        isWidgetExpanded = !isWidgetExpanded;

        if (isWidgetExpanded) {
            floatingWidget.classList.add('expanded');
            toggleIcon.className = 'fa-solid fa-chevron-right';
        } else {
            floatingWidget.classList.remove('expanded');
            toggleIcon.className = 'fa-solid fa-chevron-left';
        }
        
        // Adjust bounds constraint in case expanding pushes it off-screen
        setTimeout(() => {
            const maxLeft = phoneScreen.clientWidth - floatingWidget.clientWidth;
            if (widgetLeft > maxLeft) {
                widgetLeft = maxLeft - 4;
                floatingWidget.style.left = `${widgetLeft}px`;
            }
        }, 300);
    });

    // === 6. INTERACTIVE DECORATION CONTROLS ===

    // Widget opacity slider
    widgetOpacity.addEventListener('input', (e) => {
        const val = e.target.value;
        opacityVal.textContent = `${val}%`;
        document.documentElement.style.setProperty('--widget-opacity', val / 100);
    });

    // Center button
    btnResetWidget.addEventListener('click', resetWidgetPosition);

    // Color pickers for customized overlay theme
    colorPickerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorPickerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const color = btn.getAttribute('data-color');
            setAccentColor(color);
        });
    });

    function setAccentColor(hex) {
        document.documentElement.style.setProperty('--accent', hex);
        
        // Convert hex to rgb for background opacity bindings
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
    }

    // === 📏 SIMULATOR WIDGET SIZING SCALE (S / M / L) ===
    const widgetSizeBtn = document.getElementById('widgetSizeBtn');
    const widgetSizes = ['scale-sm', 'scale-md', 'scale-lg'];
    const widgetSizeLabels = ['0.8x', '1.0x', '1.2x'];
    let currentWidgetSizeIndex = 1; // Default to 1.0x (scale-md)

    if (widgetSizeBtn) {
        widgetSizeBtn.addEventListener('click', () => {
            floatingWidget.classList.remove('scale-sm', 'scale-md', 'scale-lg');
            currentWidgetSizeIndex = (currentWidgetSizeIndex + 1) % widgetSizes.length;
            floatingWidget.classList.add(widgetSizes[currentWidgetSizeIndex]);
            widgetSizeBtn.textContent = widgetSizeLabels[currentWidgetSizeIndex];
            showToast(`시뮬레이터 크기가 ${widgetSizeLabels[currentWidgetSizeIndex]} 배율로 조절되었습니다.`);
        });
    }

    // === ⌨️ KEYBOARD SHORTCUTS FOR PC USERS (ACCENT ON SPEED CONTROL) ===
    document.addEventListener('keydown', (e) => {
        // Only trigger if no input fields are active
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            playBtn.click();
        } else if (e.code === 'ArrowUp' || e.code === 'ArrowRight') {
            e.preventDefault();
            let speed = parseFloat(scrollSpeed.value);
            if (speed < 5.0) {
                speed = Math.min(5.0, speed + 0.1);
                scrollSpeed.value = speed;
                scrollSpeed.dispatchEvent(new Event('input'));
                showToast(`속도 증가: ${speed.toFixed(1)}x`);
            }
        } else if (e.code === 'ArrowDown' || e.code === 'ArrowLeft') {
            e.preventDefault();
            let speed = parseFloat(scrollSpeed.value);
            if (speed > 0.2) {
                speed = Math.max(0.2, speed - 0.1);
                scrollSpeed.value = speed;
                scrollSpeed.dispatchEvent(new Event('input'));
                showToast(`속도 감소: ${speed.toFixed(1)}x`);
            }
        }
    });

    // === 7. KOTLIN SOURCE CODE VIEWER ===
    
    const androidCodeTemplates = {
        floating: `package com.autoscroll.webtoon

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageButton
import android.widget.SeekBar
import android.widget.TextView

/**
 * [FloatingService]
 * 다른 앱 위에 표시되는 드래그 가능한 플로팅 컨트롤러 윈도우입니다.
 */
class FloatingService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private lateinit var params: WindowManager.LayoutParams
    
    private var isPlaying = false
    private var scrollSpeed = 15 // 기본 스크롤 스케일

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        
        // 1. 레이아웃 인플레이트
        floatingView = LayoutInflater.from(this).inflate(R.layout.layout_floating_widget, null)

        // 2. 다른 앱 위에 뜨기 위한 레이아웃 파라미터 설정
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
            x = 0
            y = 0
        }

        // 3. 윈도우 매니저에 뷰 탑재
        windowManager.addView(floatingView, params)

        // 4. 드래그 기능 구현 (OnTouchListener)
        val dragHandle = floatingView.findViewById<View>(R.id.drag_handle)
        dragHandle.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        // 드래그 방향 계산 및 윈도우 위치 업데이트
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(floatingView, params)
                        return true
                    }
                }
                return false
            }
        })

        // 5. 플레이 버튼 클릭 시 접근성 스크롤 서비스에 명령 전송
        val playBtn = floatingView.findViewById<ImageButton>(R.id.play_btn)
        playBtn.setOnClickListener {
            isPlaying = !isPlaying
            if (isPlaying) {
                playBtn.setImageResource(R.drawable.ic_pause)
                startAutoScrolling()
            } else {
                playBtn.setImageResource(R.drawable.ic_play)
                stopAutoScrolling()
            }
        }

        // 6. 스피드 조절 SeekBar 바인딩
        val speedSeekBar = floatingView.findViewById<SeekBar>(R.id.speed_seekbar)
        speedSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                scrollSpeed = progress
                updateScrollSpeed()
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    private fun startAutoScrolling() {
        val intent = Intent(this, AutoScrollService::class.java).apply {
            action = AutoScrollService.ACTION_START
            putExtra(AutoScrollService.EXTRA_SPEED, scrollSpeed)
        }
        startService(intent)
    }

    private fun stopAutoScrolling() {
        val intent = Intent(this, AutoScrollService::class.java).apply {
            action = AutoScrollService.ACTION_STOP
        }
        startService(intent)
    }

    private fun updateScrollSpeed() {
        val intent = Intent(this, AutoScrollService::class.java).apply {
            action = AutoScrollService.ACTION_UPDATE_SPEED
            putExtra(AutoScrollService.EXTRA_SPEED, scrollSpeed)
        }
        startService(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::floatingView.isInitialized) {
            windowManager.removeView(floatingView)
        }
    }
}`,
        accessibility: `package com.autoscroll.webtoon

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.content.Intent
import android.graphics.Path
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * [AutoScrollService]
 * 접근성 서비스(AccessibilityService)를 사용하여 화면 터치를 가상으로 에뮬레이션합니다.
 * 이를 통해 백그라운드에 떠있는 다른 앱(네이버 웹툰 등)을 부드럽게 스크롤해줍니다.
 */
class AutoScrollService : AccessibilityService() {

    companion object {
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_UPDATE_SPEED = "ACTION_UPDATE_SPEED"
        const val EXTRA_SPEED = "EXTRA_SPEED"
    }

    private var isScrolling = false
    private var scrollSpeed = 15
    private val mainHandler = Handler(Looper.getMainLooper())
    
    private val scrollRunnable = object : Runnable {
        override fun run() {
            if (!isScrolling) return
            
            // 화면 제스처 주입 함수 호출
            performScrollGesture()
            
            // 속도 값에 기반하여 주기적으로 갱신 호출 (단위: ms)
            // 속도가 빠를수록 대기 시간이 줄어듭니다.
            val delay = Math.max(100L, 1000L - (scrollSpeed * 80L))
            mainHandler.postDelayed(this, delay)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                scrollSpeed = intent.getIntExtra(EXTRA_SPEED, 15)
                if (!isScrolling) {
                    isScrolling = true
                    mainHandler.post(scrollRunnable)
                }
            }
            ACTION_STOP -> {
                isScrolling = false
                mainHandler.removeCallbacks(scrollRunnable)
            }
            ACTION_UPDATE_SPEED -> {
                scrollSpeed = intent.getIntExtra(EXTRA_SPEED, 15)
            }
        }
        return START_STICKY
    }

    /**
     * 핵심 로직: 터치 제스처를 주입하여 드래그 스크롤을 시뮬레이트합니다.
     */
    private fun performScrollGesture() {
        val displayMetrics = resources.displayMetrics
        val screenHeight = displayMetrics.heightPixels
        val screenWidth = displayMetrics.widthPixels

        // 화면 정중앙 좌표 계산
        val centerX = screenWidth / 2f
        
        // 스크롤 드래그 패스 정의 (밑에서 위로 스크롤)
        val startY = screenHeight * 0.75f // 화면 하단부
        
        // 속도에 따라 한번의 드래그 길이 지정
        val dragAmount = 150f + (scrollSpeed * 10f)
        val endY = startY - dragAmount 

        val scrollPath = Path().apply {
            moveTo(centerX, startY)
            lineTo(centerX, endY)
        }

        // 제스처 설명 오브젝트 생성 (드래그 지속 속도: 250ms)
        val gestureBuilder = GestureDescription.Builder()
        val stroke = GestureDescription.StrokeDescription(scrollPath, 0, 250)
        gestureBuilder.addStroke(stroke)

        // 제스처 실행 주입!
        dispatchGesture(gestureBuilder.build(), object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                super.onCompleted(gestureDescription)
                Log.d("ScrollService", "제스처 주입 성공")
            }

            override fun onCancelled(gestureDescription: GestureDescription?) {
                super.onCancelled(gestureDescription)
                Log.d("ScrollService", "제스처 실패 (화면 간섭)")
            }
        }, null)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // 이벤트 트래킹 불필요
    }

    override fun onInterrupt() {
        isScrolling = false
        mainHandler.removeCallbacks(scrollRunnable)
    }
}`,
        main: `package com.autoscroll.webtoon

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * [MainActivity]
 * 앱이 구동될 때 2가지 핵심 권한을 획득하도록 중재하고 서비스를 실행시킵니다.
 * 1. 다른 앱 위에 그리기 오버레이 권한 (SYSTEM_ALERT_WINDOW)
 * 2. 제스처 주입을 위한 접근성 권한 (Accessibility Service)
 */
class MainActivity : AppCompatActivity() {

    private val OVERLAY_PERMISSION_REQ_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnStart = findViewById<Button>(R.id.btn_start_service)
        btnStart.setOnClickListener {
            if (checkOverlayPermission()) {
                if (checkAccessibilityPermission()) {
                    // 모든 권한 통과 시 백그라운드 위젯 실행
                    val intent = Intent(this, FloatingService::class.java)
                    startService(intent)
                    finish() // 설정 후 메인화면 백스택 종료
                } else {
                    requestAccessibilityPermission()
                }
            } else {
                requestOverlayPermission()
            }
        }
    }

    /**
     * 1단계: 다른 앱 위에 그리기 권한 여부 체크
     */
    private fun checkOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivityForResult(intent, OVERLAY_PERMISSION_REQ_CODE)
            Toast.makeText(this, "다른 앱 위에 그리기 권한을 허용해 주세요.", Toast.LENGTH_LONG).show()
        }
    }

    /**
     * 2단계: 접근성 서비스 활성화 상태 체크
     */
    private fun checkAccessibilityPermission(): Boolean {
        val am = getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
        val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_GENERIC)
        for (service in enabledServices) {
            if (service.resolveInfo.serviceInfo.packageName == packageName) {
                return true
            }
        }
        return false
    }

    private fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
        Toast.makeText(this, "설정 -> 접근성 -> '웹툰 자동 스크롤러'를 활성화해 주세요.", Toast.LENGTH_LONG).show()
    }
}`,
        manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.autoscroll.webtoon">

    <!-- 1. 다른 앱 위에 오버레이 뷰를 띄우기 위한 필수 권한 -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    
    <!-- 2. 백그라운드 오레오 이상 기기 서비스 동작용 -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="웹툰 자동 스크롤러"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 3. 드래그 가능한 플로팅 컨트롤러 서비스 선언 -->
        <service
            android:name=".FloatingService"
            android:enabled="true"
            android:exported="false" />

        <!-- 4. 터치 스크롤 자동 입력을 위한 접근성 서비스 선언 -->
        <service
            android:name=".AutoScrollService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.view.accessibility.AccessibilityService" />
            </intent-filter>
            
            <!-- 접근성 서비스 세부 설정을 위한 XML 참조 -->
            <meta-data
                android:name="android.view.accessibility.AccessibilityService"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>
</manifest>`
    };

    // Initialize code viewer with FloatingService
    function updateCodeView(key) {
        if (androidCodeTemplates[key]) {
            codeDisplay.textContent = androidCodeTemplates[key];
        }
    }
    updateCodeView('floating');

    codeFileSelect.addEventListener('change', (e) => {
        updateCodeView(e.target.value);
    });

    // Copy Code functionality
    copyCodeBtn.addEventListener('click', () => {
        const text = codeDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast("코드가 클립보드에 성공적으로 복사되었습니다!");
        }).catch(err => {
            console.error("클립보드 복사 실패: ", err);
        });
    });

    // === 8. TOAST NOTIFICATION ===
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // === 9. TAB SYSTEM ===
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

});
