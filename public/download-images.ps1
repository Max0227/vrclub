# download-images.ps1
# Запуск: правой кнопкой по файлу -> "Выполнить с помощью PowerShell"
# Или в терминале: .\download-images.ps1

$baseDir = $PSScriptRoot

# Создаём необходимые папки
$folders = @(
    "images/hero",
    "images/equipment", 
    "images/certificates",
    "images/invitations",
    "images/pricing",
    "images/mocks",
    "images/games"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $baseDir $folder
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "📁 Создана папка: $folder" -ForegroundColor Green
    }
}

# Список изображений
$images = @(
    # Hero
    @{ Url = "https://readdy.ai/api/search-image?query=group%20of%20happy%20young%20people%20wearing%20VR%20headsets%20Oculus%20Quest%20in%20dark%20gaming%20room%20laughing%20excited%20arms%20raised%20immersive%20experience%20blurred%20bokeh%20depth%20of%20field%20cinematic%20shallow%20focus%20neon%20cyan%20pink%20lighting%20vibrant%20atmosphere%20friends%20having%20fun%20virtual%20reality%20club&width=1920&height=1080&seq=hero_vr_people_blur_v1&orientation=landscape"; Dest = "images/hero/hero-bg.jpg" }
    
    # Games banner
    @{ Url = "https://readdy.ai/api/search-image?query=VR%20gaming%20center%20dark%20neon%20arcade%20room%20glowing%20headsets%20professional%20interior&width=1200&height=500&seq=vrgames2026a&orientation=landscape"; Dest = "images/games/banner.jpg" }
    
    # Equipment
    @{ Url = "https://readdy.ai/api/search-image?query=Meta%20Oculus%20Quest%202%20VR%20headset%20close-up%20product%20photo%20floating%20in%20dark%20void%20with%20electric%20cyan%20neon%20glow%20rays%20premium%20gadget%20photography%20minimalist%20dark%20background%20lens%20reflection&width=800&height=520&seq=eq01v2&orientation=landscape"; Dest = "images/equipment/oculus-quest-2.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=Sony%20PlayStation%205%20PS5%20console%20white%20futuristic%20design%20on%20dark%20surface%20with%20purple%20violet%20neon%20light%20reflection%20gaming%20setup%20premium%20product%20photo%20studio%20shot&width=800&height=520&seq=eq02v2&orientation=landscape"; Dest = "images/equipment/playstation-5.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=MOZA%20professional%20racing%20simulator%20steering%20wheel%20and%20pedals%20cockpit%20setup%20dark%20gaming%20room%20pink%20red%20magenta%20neon%20light%20reflection%20force%20feedback%20wheel%20premium%20sim%20racing%20rig&width=800&height=520&seq=eq03v2&orientation=landscape"; Dest = "images/equipment/moza-racing.jpg" }
    
    # Certificates
    @{ Url = "https://readdy.ai/api/search-image?query=person%20wearing%20Oculus%20Quest%202%20VR%20headset%20cyberpunk%20neon%20glow%20cyan%20light%20immersive%20virtual%20reality%20gaming%20dark%20background%20futuristic%202026%20professional%20photo&width=600&height=360&seq=cert_vr30&orientation=landscape"; Dest = "images/certificates/cert-vr-30min.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=full%20immersive%20virtual%20reality%20experience%20Oculus%20Quest%202%20player%20arms%20outstretched%20neon%20pink%20cyan%20lights%20cyberpunk%20dark%20room%20exciting%20gaming%20adventure&width=600&height=360&seq=cert_vr60&orientation=landscape"; Dest = "images/certificates/cert-vr-60min.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=PlayStation%205%20white%20console%20controller%20neon%20purple%20glow%20dark%20cyberpunk%20background%20gaming%20setup%20ultrawide%204K%20display%20couch%20multiplayer%20gaming%20room&width=600&height=360&seq=cert_ps5&orientation=landscape"; Dest = "images/certificates/cert-ps5.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=MOZA%20racing%20simulator%20cockpit%20steering%20wheel%20racing%20seat%20pedals%20neon%20lights%20cyberpunk%20dark%20room%20Forza%20Horizon%20race%20track%20high%20speed%20drift%20gaming&width=600&height=360&seq=cert_moza&orientation=landscape"; Dest = "images/certificates/cert-moza.jpg" }
    
    # Invitations banner
    @{ Url = "https://readdy.ai/api/search-image?query=birthday%20party%20celebration%20cyberpunk%20neon%20lights%20dark%20room%20pink%20purple%20glow%20futuristic%20festive%20confetti%20streamers%20luxury%20vip%20event%20hall%20dark%20atmosphere&width=1200&height=400&seq=inv_banner01&orientation=landscape"; Dest = "images/invitations/birthday-banner.jpg" }
    
    # Pricing backgrounds
    @{ Url = "https://readdy.ai/api/search-image?query=dark%20futuristic%20cyberpunk%20VR%20gaming%20room%20interior%20wide%20angle%20neon%20cyan%20magenta%20lights%20glowing%20panels%20immersive%20virtual%20reality%20club%20night%20atmosphere%20moody%20dramatic%20lighting&width=1920&height=1080&seq=prices_bg_hero_v3&orientation=landscape"; Dest = "images/pricing/hero-bg.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=VR%20gaming%20club%20interior%20group%20of%20people%20playing%20virtual%20reality%20games%20together%20neon%20lights%20futuristic%20room%20wide%20shot%20dark%20atmosphere&width=900&height=220&seq=pricing_cta_bg01&orientation=landscape"; Dest = "images/pricing/cta-bg.jpg" }
    
    # Pricing cards
    @{ Url = "https://readdy.ai/api/search-image?query=two%20players%20wearing%20Oculus%20Quest%202%20VR%20headsets%20in%20dark%20neon%20gaming%20room%20cyan%20blue%20ambient%20light%20smiling%20immersive%20virtual%20reality%20experience%20friends&width=600&height=320&seq=prices_vr01&orientation=landscape"; Dest = "images/pricing/vr-2players.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=group%20four%20friends%20wearing%20VR%20headsets%20together%20dark%20neon%20gaming%20club%20room%20cyan%20blue%20neon%20lights%20laughing%20excited%20enjoying%20virtual%20reality%20experience%20party&width=600&height=320&seq=prices_vr4_02&orientation=landscape"; Dest = "images/pricing/vr-4players.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=professional%20MOZA%20racing%20simulator%20cockpit%20seat%20steering%20wheel%20pedals%20dark%20room%20dramatic%20pink%20magenta%20neon%20lighting%20race%20track%20on%20monitor%20screen%20speed&width=600&height=320&seq=prices_moza03&orientation=landscape"; Dest = "images/pricing/moza-card.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=friends%20playing%20PlayStation%205%20video%20games%20on%20big%20screen%20TV%20dark%20lounge%20sofa%20purple%20violet%20neon%20ambient%20light%20laughing%20excited%20modern%20gaming%20room%20entertainment&width=600&height=320&seq=prices_ps5_04&orientation=landscape"; Dest = "images/pricing/ps5-card.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=spacious%20modern%20VR%20gaming%20club%20interior%20wide%20angle%20view%20multiple%20stations%20dark%20room%20colorful%20neon%20lights%20premium%20entertainment%20venue%20full%20room%20party%20birthday&width=600&height=320&seq=prices_club05&orientation=landscape"; Dest = "images/pricing/club-full.jpg" }
    
    # Mocks (тарифы)
    @{ Url = "https://readdy.ai/api/search-image?query=young%20person%20wearing%20black%20VR%20headset%20Oculus%20Quest%202%20in%20dark%20gaming%20room%20with%20cyan%20neon%20lights%20glowing%20on%20face%20excited%20expression%20hands%20raised%20immersive%20virtual%20world&width=600&height=340&seq=vr30min_a1&orientation=landscape"; Dest = "images/mocks/vr-30min.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=two%20people%20wearing%20VR%20headsets%20smiling%20happy%20dark%20neon%20gaming%20lounge%20cyan%20blue%20ambient%20glow%20modern%20interior%20friends%20enjoying%20virtual%20reality%20game%20together&width=600&height=340&seq=vr1hr_b2&orientation=landscape"; Dest = "images/mocks/vr-1hour.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=group%20four%20people%20wearing%20VR%20headsets%20together%20in%20dark%20neon%20gaming%20club%20room%20playing%20together%20friends%20excited%20cyan%20blue%20light%20modern%20gaming%20lounge&width=600&height=340&seq=vr4hr_g7&orientation=landscape"; Dest = "images/mocks/vr-4hours.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=close%20up%20racing%20steering%20wheel%20and%20hands%20gripping%20tight%20dramatic%20racing%20simulator%20setup%20dark%20cockpit%20motion%20blur%20speed%20neon%20red%20pink%20glow%20professional%20sim%20rig&width=600&height=340&seq=moza15_c3&orientation=landscape"; Dest = "images/mocks/moza-15min.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=full%20racing%20simulator%20cockpit%20seat%20steering%20wheel%20pedals%20triple%20monitor%20setup%20race%20track%20on%20screen%20dark%20gaming%20room%20dramatic%20pink%20magenta%20lighting%20professional%20setup&width=600&height=340&seq=moza30_d4&orientation=landscape"; Dest = "images/mocks/moza-30min.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=group%20friends%20playing%20video%20game%20console%20big%20TV%20screen%20dark%20lounge%20sofa%20couch%20purple%20violet%20neon%20ambient%20light%20laughing%20excited%20gaming%20together%20entertainment&width=600&height=340&seq=ps5_e5&orientation=landscape"; Dest = "images/mocks/ps5.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=spacious%20modern%20gaming%20club%20interior%20wide%20angle%20view%20multiple%20stations%20VR%20headsets%20racing%20simulators%20screens%20dark%20room%20colorful%20neon%20lights%20premium%20entertainment%20venue%20full%20room&width=600&height=340&seq=fullclub_f6&orientation=landscape"; Dest = "images/mocks/club-full.jpg" }
)

Write-Host "`n📥 Начинаю скачивание изображений..." -ForegroundColor Cyan

$total = $images.Count
$current = 0

foreach ($img in $images) {
    $current++
    $destPath = Join-Path $baseDir $img.Dest
    $percent = [math]::Round(($current / $total) * 100)
    
    Write-Host "[$current/$total] ($percent%) Скачивание: $($img.Dest)" -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $img.Url -OutFile $destPath -UseBasicParsing
        Write-Host "  ✅ Готово: $($img.Dest)" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Ошибка: $($img.Dest)" -ForegroundColor Red
        Write-Host "     URL: $($img.Url)" -ForegroundColor DarkRed
    }
}

Write-Host "`n✨ Загрузка завершена!" -ForegroundColor Green
Write-Host "📁 Файлы сохранены в папке: $baseDir\images\" -ForegroundColor Cyan