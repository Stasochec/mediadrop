# MediaDrop — Универсальный сервис скачивания медиа (YouTube, TikTok, X)

<div align="center">
  <h3>Скачивание видео и аудио в максимальном качестве (до 4K / 1080p)</h3>
  <p>Премиальный адаптивный PWA веб-сайт с возможностью бесплатного размещения на <strong>GitHub Pages</strong> и подключения к бесплатному облаку (0 рублей затрат).</p>
</div>

---

## 🌟 Как развернуть сайт на GitHub Pages (Бесплатно)

В репозитории уже настроен автоматический CI/CD сценарий GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

### Шаг 1. Создайте репозиторий на GitHub
1. Перейдите на [github.com/new](https://github.com/new) и создайте новый публичный репозиторий (например, `mediadrop` или `vid`).
2. В терминале в папке проекта на компьютере выполните:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
git push -u origin main
```

### Шаг 2. Включите GitHub Pages
1. В вашем репозитории на GitHub перейдите в **Settings** (Настройки) ➔ **Pages** (слева в меню).
2. В блоке **Build and deployment** в выпадающем списке **Source** выберите:
   👉 **GitHub Actions**.
3. Подождите 1–2 минуты — во вкладке **Actions** автоматически выполнится сборка и появится зеленая галочка с адресом вашего сайта:
   🌐 `https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПОЗИТОРИЯ/`

Сайт доступен всему миру в интернете!

---

## ☁️ Где бесплатно захостить бэкенд (0 рублей)

Так как GitHub Pages отдает только статические файлы (HTML/JS), бэкенд парсинга `yt-dlp` можно бесплатно развернуть на любом бесплатном облаке:

### Вариант 1: Hugging Face Spaces (Рекомендуемый, 16 ГБ RAM бесплатно!)
1. Зарегистрируйтесь на [huggingface.co](https://huggingface.co).
2. В правом верхнем углу нажмите на аватар ➔ **New Space**.
3. Укажите имя (например, `mediadrop-api`), выберите:
   - **License:** MIT
   - **Space SDK:** **Docker** (Blank)
   - **Space hardware:** Бесплатный (Free 2 vCPU, 16 GB RAM).
4. Загрузите файлы из папки `backend` (`Dockerfile`, `requirements.txt`, папку `app`, `run.py`).
5. Через 1 минуту ваш бэкенд соберется и заработает по постоянному адресу:
   `https://ВАШ_НИК-mediadrop-api.hf.space`

### Вариант 2: Render.com
1. Зарегистрируйтесь на [render.com](https://render.com).
2. Нажмите **New +** ➔ **Web Service** ➔ подключите ваш GitHub-репозиторий.
3. Укажите:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Получите бесплатную ссылку: `https://mediadrop-api.onrender.com`.

---

## 🔗 Как связать сайт на GitHub с вашим бесплатным бэкендом

1. Откройте ваш сайт на GitHub Pages.
2. В правом верхнем углу шапки нажмите иконку **⚙️ (Настройки)**.
3. В поле **«Адрес бэкенд-сервера»** вставьте ссылку на ваш бесплатный бэкенд (например, `https://username-mediadrop.hf.space` или `https://mediadrop.onrender.com`).
4. Нажмите **«Проверить связь»** ➔ появится зеленая галочка «Соединение установлено!».
5. Нажмите **«Сохранить»**.

Теперь ваш сайт на GitHub Pages полностью функционален: скачивает видео с YouTube (до 4K), TikTok (без водяных знаков) и X/Twitter прямо в браузере, не требуя ни копейки денег и работая 24/7!

---

## 💻 Локальный запуск на компьютере (если нужно)

- Запуск: дважды нажмите по [`start.bat`](start.bat) ➔ сайт откроется на [http://localhost:5173](http://localhost:5173).
- Остановка: дважды нажмите по [`stop.bat`](stop.bat).
