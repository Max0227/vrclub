# download-games.ps1
# Скрипт для скачивания картинок игр VR, PS5 и MOZA

$baseDir = $PSScriptRoot

# Создаём папки для игр
$folders = @(
    "images/games/vr",
    "images/games/ps5",
    "images/games/moza"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $baseDir $folder
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "📁 Создана папка: $folder" -ForegroundColor Green
    }
}

# Список изображений VR игр (29 штук)
$vrGames = @(
    @{ Url = "https://readdy.ai/api/search-image?query=futuristic%20cartoon%20office%20robots%20holographic%20screens%20colorful%20humorous%20virtual%20reality%20workplace%20bright%20pop%20art%20style&width=400&height=280&seq=vr_job_x01&orientation=landscape"; Name = "job-simulator.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=cute%20funny%20cat%20knocking%20things%20off%20table%20colorful%20room%20cartoon%20style%20first%20person%20paw%20view%20chaos%20humor%20bright%20colors&width=400&height=280&seq=vr_cat_x02&orientation=landscape"; Name = "i-am-cat.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=tropical%20island%20survival%20beach%20crystal%20blue%20water%20palm%20trees%20cartoon%20style%20bright%20sunshine%20colorful%20sky%20first%20person%20view&width=400&height=280&seq=vr_isl_x03&orientation=landscape"; Name = "island-time.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=cartoon%20zombie%20horde%20outside%20apartment%20building%20objects%20flying%20balcony%20window%20throwing%20chaos%20fun%20colorful%20game%20scene&width=400&height=280&seq=vr_thr_x04&orientation=landscape"; Name = "throw-anything.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=rocket%20launch%20pad%20extreme%20height%20open%20space%20dark%20sky%20neon%20glow%20sci-fi%20thriller%20fear%20atmosphere%20space%20station%20dramatic%20view&width=400&height=280&seq=vr_ext_x05&orientation=landscape"; Name = "extreme-escape.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=futuristic%20shooter%20arena%20neon%20lights%20weapons%20sci-fi%20colorful%20combat%20cyberpunk%20multiplayer%20action%20game%20bright%20colorful%20battlefield&width=400&height=280&seq=vr_gun_x06&orientation=landscape"; Name = "gun-raiders.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=rock%20climbing%20extreme%20height%20mountain%20cliff%20scenic%20view%20sunset%20hands%20gripping%20rock%20adrenaline%20sport%20realistic%20nature%20landscape&width=400&height=280&seq=vr_clm_x07&orientation=landscape"; Name = "the-climb.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=dark%20creepy%20restaurant%20animatronic%20robot%20bear%20night%20horror%20atmosphere%20security%20desk%20dim%20lighting%20terrifying%20dark%20ambiance&width=400&height=280&seq=vr_fnaf_x08&orientation=landscape"; Name = "five-nights-at-freddys.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=boxing%20ring%20professional%20fight%20gloves%20punching%20athletic%20sport%20arena%20crowd%20dramatic%20stadium%20lighting%20intense%20match%20action%20sports&width=400&height=280&seq=vr_crd_x09&orientation=landscape"; Name = "creed-rise-to-glory.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=two%20glowing%20neon%20lightsabers%20red%20blue%20slicing%20colorful%20flying%20blocks%20dark%20stage%20laser%20music%20rhythm%20game%20cyberpunk%20futuristic&width=400&height=280&seq=vr_bts_x10&orientation=landscape"; Name = "beat-saber.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=dark%20scary%20horror%20environment%20spiders%20cobwebs%20dark%20room%20fear%20atmosphere%20virtual%20horror%20game%20creepy%20dark%20moody%20atmosphere%20neon&width=400&height=280&seq=vr_ff2_x11&orientation=landscape"; Name = "face-fears-ii.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=colorful%20spray%20paint%20graffiti%20street%20art%20urban%20wall%20vibrant%20neon%20colors%20artist%20painting%20mural%20creative%20urban%20art%20bright%20vivid&width=400&height=280&seq=vr_ksp_x12&orientation=landscape"; Name = "kingspray.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=medieval%20fantasy%20sword%20fight%20dark%20dungeon%20magic%20castle%20warrior%20combat%20first%20person%20sword%20shield%20glowing%20spells%20dark%20atmosphere&width=400&height=280&seq=vr_bls_x13&orientation=landscape"; Name = "blade-and-sorcery.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=cartoon%20gladiator%20arena%20mace%20sword%20chain%20weapon%20colorful%20brutal%20combat%20arena%20warriors%20medieval%20colorful%20fun%20fighting%20game&width=400&height=280&seq=vr_grn_x14&orientation=landscape"; Name = "gorn.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=ancient%20Rome%20colosseum%20sand%20arena%20gladiator%20battle%20crowd%20epic%20sword%20shield%20combat%20Roman%20amphitheater%20dramatic%20sunset%20sky&width=400&height=280&seq=vr_gld_x15&orientation=landscape"; Name = "gladius.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=colorful%20beach%20resort%20cartoon%20robot%20tourists%20sunny%20tropical%20holiday%20bright%20fun%20cheerful%20relaxing%20activities%20summer%20vibe&width=400&height=280&seq=vr_vac_x16&orientation=landscape"; Name = "vacation-simulator.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=bar%20fight%20cartoon%20funny%20tavern%20glasses%20bottles%20flying%20chaos%20neon%20bar%20signs%20humor%20dark%20pub%20interior%20colorful%20chaos%20scene&width=400&height=280&seq=vr_dbf_x17&orientation=landscape"; Name = "drunkn-bar-fight.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=table%20tennis%20ping%20pong%20realistic%20match%20table%20net%20ball%20paddle%20indoor%20sports%20arena%20clean%20professional%20court%20sports%20game&width=400&height=280&seq=vr_ett_x18&orientation=landscape"; Name = "eleven-table-tennis.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=biplane%20dogfight%20World%20War%201%20cockpit%20view%20clouds%20air%20combat%20vintage%20aircraft%20explosion%20dramatic%20sky%20aerial%20battle%20historic&width=400&height=280&seq=vr_wp1_x19&orientation=landscape"; Name = "warplanes-ww1.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=snowboard%20mountain%20slope%20winter%20first%20person%20snow%20spray%20tricks%20speed%20snowy%20mountain%20scenery%20white%20powder%20sport%20extreme%20action&width=400&height=280&seq=vr_snb_x20&orientation=landscape"; Name = "carve-snowboarding.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=colorful%20cartoon%20fighting%20game%20characters%20boxing%20arena%20family%20friendly%20sport%20combat%20bright%20vivid%20stage%20fun%20game%20art%20style&width=400&height=280&seq=vr_wif_x21&orientation=landscape"; Name = "wii-fighters.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=snowboarding%20freestyle%20halfpipe%20aerial%20jump%20winter%20mountain%20sunset%20vibrant%20sky%20sport%20extreme%20action%20speed%20winter%20games&width=400&height=280&seq=vr_sno_x22&orientation=landscape"; Name = "snowboarding.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=elven%20archer%20fantasy%20forest%20bow%20arrows%20magical%20glowing%20lights%20mystical%20ancient%20trees%20combat%20first%20person%20fantasy%20game%20scene&width=400&height=280&seq=vr_elv_x23&orientation=landscape"; Name = "elven-combat.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=roller%20coaster%20fast%20speed%20theme%20park%20shooting%20action%20colorful%20tracks%20bright%20lights%20fun%20adventure%20game%20neon%20vibrant%20scene&width=400&height=280&seq=vr_coc_x24&orientation=landscape"; Name = "coaster-combat.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=wizard%20tower%20magic%20potions%20glowing%20crystal%20ball%20spells%20books%20fantasy%20mystical%20atmosphere%20magical%20particles%20hands%20casting%20spells%20dark&width=400&height=280&seq=vr_wow_x25&orientation=landscape"; Name = "waltz-of-the-wizard.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=post%20apocalyptic%20desert%20zombie%20horde%20dusty%20highway%20gun%20first%20person%20shooter%20survival%20dramatic%20desolate%20landscape%20abandoned&width=400&height=280&seq=vr_azs_x26&orientation=landscape"; Name = "arizona-sunshine.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=minimalist%20stylized%20low%20poly%20red%20white%20enemies%20slow%20motion%20bullet%20dodge%20matrix%20effect%20abstract%20geometric%20art%20style%20game&width=400&height=280&seq=vr_sht_x27&orientation=landscape"; Name = "superhot-vr.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=tactical%20military%20shooter%20realistic%20weapons%20urban%20combat%20building%20interior%20dark%20corridor%20counter-strike%20style%20first%20person%20gritty%20action&width=400&height=280&seq=vr_pvl_x28&orientation=landscape"; Name = "pavlov-vr.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=green%20jungle%20forest%20low%20poly%20gorilla%20climbing%20trees%20bright%20colorful%20cartoon%20style%20multiplayer%20game%20fun%20arms%20locomotion%20playful&width=400&height=280&seq=vr_grt_x29&orientation=landscape"; Name = "gorilla-tag.jpg" }
)

# Список изображений PS5 игр (11 штук)
$ps5Games = @(
    @{ Url = "https://readdy.ai/api/search-image?query=cartoon%20spaceship%20crew%20colorful%20bean%20characters%20orange%20blue%20red%20space%20station%20bright%20simple%20art%20flat%20design%20social%20game%20vibrant&width=400&height=280&seq=ps5_amu_x30&orientation=landscape"; Name = "among-us.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=cute%20blue%20robot%20mascot%20cheerful%20platformer%20world%20bright%20colorful%20cartoon%20PlayStation%20game%20environment%20playful%20shiny%20armor%20fun&width=400&height=280&seq=ps5_ast_x31&orientation=landscape"; Name = "astro-playroom.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=MMA%20octagon%20cage%20UFC%20fight%20realistic%20muscular%20athletes%20combat%20sport%20dramatic%20arena%20lighting%20punch%20kick%20professional%20fighting%20game&width=400&height=280&seq=ps5_ufc_x32&orientation=landscape"; Name = "ufc-5.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=football%20soccer%20stadium%20night%20match%20green%20field%20packed%20crowd%20celebrating%20goal%20cinematic%20lighting%20professional%20league%20realistic%20sport&width=400&height=280&seq=ps5_fif_x33&orientation=landscape"; Name = "fifa-2024.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=colorful%20cartoon%20battle%20royale%20island%20colorful%20characters%20weapons%20building%20structures%20vibrant%20neon%20game%20stylized%20art%20pop%20colors%20action&width=400&height=280&seq=ps5_ftn_x34&orientation=landscape"; Name = "fortnite.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=cinematic%20city%20skyline%20open%20world%20crime%20game%20golden%20sunset%20skyscrapers%20highway%20cars%20aerial%20view%20dramatic%20atmosphere%20Los%20Santos&width=400&height=280&seq=ps5_gta_x35&orientation=landscape"; Name = "gta-5.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=LEGO%20bricks%20colorful%20plastic%20toy%20robot%20dinosaur%20mechanical%20creatures%20bright%20adventure%20world%20playful%20cute%20toy%20environment&width=400&height=280&seq=ps5_lgo_x36&orientation=landscape"; Name = "lego-horizon.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=wobbly%20white%20blob%20ragdoll%20character%20falling%20climbing%20colorful%20cartoon%20puzzle%20environment%20pastel%20colors%20funny%20physics%20humorous%20simple%20game&width=400&height=280&seq=ps5_hff_x37&orientation=landscape"; Name = "human-fall-flat.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=street%20racing%20car%20drifting%20graffiti%20street%20art%20urban%20night%20neon%20lights%20smoke%20stylized%20anime%20cel%20shading%20colorful%20dark%20city&width=400&height=280&seq=ps5_nfs_x38&orientation=landscape"; Name = "nfs-unbound.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=creepy%20abandoned%20toy%20factory%20dark%20industrial%20eerie%20lighting%20scary%20vintage%20blue%20monster%20horror%20atmosphere%20unsettling%20dark%20halls&width=400&height=280&seq=ps5_pop_x39&orientation=landscape"; Name = "poppy-playtime.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=tropical%20jungle%20ancient%20ruins%20treasure%20hunt%20cinematic%20action%20adventure%20temple%20exploration%20lush%20green%20scenery%20dramatic%20lighting%20movie%20style&width=400&height=280&seq=ps5_unc_x40&orientation=landscape"; Name = "uncharted.jpg" }
)

# Список изображений MOZA игр (4 штуки)
$mozaGames = @(
    @{ Url = "https://readdy.ai/api/search-image?query=supercar%20fast%20racing%20open%20world%20sunset%20desert%20mountains%20colorful%20vibrant%20cinematic%20drift%20beautiful%20landscape%20cars%20speed%20wide%20angle&width=400&height=280&seq=mz_fh5_x41&orientation=landscape"; Name = "forza-horizon-5.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=realistic%20car%20crash%20crumple%20deformation%20physics%20simulation%20metal%20bending%20vehicle%20damage%20dramatic%20impact%20realistic%20automobile%20destruction&width=400&height=280&seq=mz_bmg_x42&orientation=landscape"; Name = "beamng-drive.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=professional%20racing%20simulator%20track%20circuit%20Ferrari%20sports%20car%20cockpit%20ultra%20realistic%20graphics%20race%20track%20sunny%20dramatic%20perspective&width=400&height=280&seq=mz_acc_x43&orientation=landscape"; Name = "assetto-corsa.jpg" }
    @{ Url = "https://readdy.ai/api/search-image?query=rally%20car%20muddy%20forest%20track%20rain%20wet%20gravel%20slide%20dramatic%20motion%20fast%20speed%20forest%20rally%20stage%20co-driver%20trees%20dirt%20road&width=400&height=280&seq=mz_drt_x44&orientation=landscape"; Name = "dirt-rally-2.jpg" }
)

Write-Host "`n📥 Начинаю скачивание игровых изображений..." -ForegroundColor Cyan

# Функция для скачивания
function Download-Games {
    param (
        [string]$category,
        [array]$games,
        [string]$folder
    )
    
    $total = $games.Count
    $current = 0
    
    Write-Host "`n🎮 Категория: $category ($total игр)" -ForegroundColor Magenta
    
    foreach ($game in $games) {
        $current++
        $destPath = Join-Path $baseDir $folder
        $destFile = Join-Path $destPath $game.Name
        $percent = [math]::Round(($current / $total) * 100)
        
        Write-Host "[$current/$total] ($percent%) $($game.Name)" -ForegroundColor Yellow
        
        try {
            Invoke-WebRequest -Uri $game.Url -OutFile $destFile -UseBasicParsing
            Write-Host "  ✅ Сохранено: $folder/$($game.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "  ❌ Ошибка: $($game.Name)" -ForegroundColor Red
        }
    }
}

# Скачиваем все категории
Download-Games -category "VR" -games $vrGames -folder "images/games/vr"
Download-Games -category "PS5" -games $ps5Games -folder "images/games/ps5"
Download-Games -category "MOZA" -games $mozaGames -folder "images/games/moza"

Write-Host "`n✨ Загрузка завершена!" -ForegroundColor Green
Write-Host "📁 Файлы сохранены в папках:" -ForegroundColor Cyan
Write-Host "   - public/images/games/vr/ (29 файлов)" -ForegroundColor Cyan
Write-Host "   - public/images/games/ps5/ (11 файлов)" -ForegroundColor Cyan
Write-Host "   - public/images/games/moza/ (4 файла)" -ForegroundColor Cyan