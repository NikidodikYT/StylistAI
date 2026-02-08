# StylistAI - Полная техническая документация фронтенда

## 1. Общее описание проекта

**StylistAI** - мобильное веб-приложение (mobile-first SPA) для управления гардеробом и получения AI-рекомендаций по стилю. Приложение работает как одностраничное приложение с вкладками внизу (tab-bar navigation), без серверной части - все данные хранятся в localStorage через Zustand persist.

**Основные фичи:**
- Чат с AI-стилистом (mock-ответы, карусель образов, отправка фото)
- Гардероб (каталог вещей, фильтрация, избранное, добавление новых вещей с фото)
- Коллекции (сохраненные образы, детальный просмотр)
- Профиль (параметры тела, настройки темы, статистика)
- Авторизация (mock, email + пароль)

---

## 2. Технологический стек

| Технология | Версия | Назначение |
|---|---|---|
| **Next.js** | 16.0.10 | Фреймворк (App Router) |
| **React** | 19.2.0 | UI библиотека |
| **TypeScript** | ^5 | Типизация |
| **Tailwind CSS** | ^4.1.9 | Стили (v4, без tailwind.config.js) |
| **Zustand** | 5.0.11 | Глобальный стейт + persist в localStorage |
| **shadcn/ui** | - | UI-компоненты (Radix UI + Tailwind) |
| **Lucide React** | ^0.454.0 | Иконки |
| **Embla Carousel** | 8.5.1 | Карусель образов в чате |
| **next-themes** | ^0.4.6 | Переключение тем (не используется напрямую, тема управляется через store) |
| **Vaul** | ^1.1.2 | Drawer (выдвижные панели снизу) |
| **Zod** | 3.25.76 | Валидация (подключен, но не используется активно) |
| **react-hook-form** | ^7.60.0 | Формы (подключен) |

---

## 3. Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (Turbopack по умолчанию в Next.js 16)
npm run dev

# Продакшн-сборка
npm run build

# Запуск продакшн-сервера
npm start

# Линтинг
npm run lint
```

Приложение доступно по адресу `http://localhost:3000`.

---

## 4. Структура проекта

```
/
├── app/
│   ├── globals.css          # Tailwind v4 конфиг + CSS-токены тем (light/dark)
│   ├── layout.tsx           # Root layout: шрифты Geist, метаданные, Vercel Analytics
│   └── page.tsx             # Единственная страница, рендерит <AppLayout />
│
├── components/
│   ├── app-layout.tsx       # Главный layout: hydration guard, auth gate, tab router
│   ├── bottom-nav.tsx       # Нижняя навигация (4 вкладки)
│   ├── add-item-dialog.tsx  # Диалог добавления вещи в гардероб
│   ├── outfit-card.tsx      # Карточка образа (коллаж из фото вещей)
│   ├── image-upload-input.tsx # Компонент загрузки фото (icon/button варианты)
│   ├── theme-provider.tsx   # ThemeProvider обертка (next-themes)
│   │
│   ├── screens/
│   │   ├── auth-screen.tsx       # Экран авторизации/регистрации
│   │   ├── chat-screen.tsx       # Чат с AI (сообщения, карусель, фото)
│   │   ├── wardrobe-screen.tsx   # Гардероб (сетка вещей, фильтры, детали)
│   │   ├── collections-screen.tsx # Коллекции образов (сетка, детальный лист)
│   │   └── profile-screen.tsx    # Профиль (параметры, настройки, выход)
│   │
│   └── ui/                  # shadcn/ui компоненты (~50 файлов)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── carousel.tsx
│       ├── switch.tsx
│       └── ... (и другие)
│
├── lib/
│   ├── types.ts             # Все TypeScript интерфейсы и константы
│   ├── store.ts             # Zustand store (весь стейт приложения)
│   ├── mock-data.ts         # Мок-данные: вещи, образы, чат-сообщения, AI-ответы
│   ├── actions.ts           # Вспомогательные функции (валидация, CRUD-заглушки)
│   └── utils.ts             # Утилита cn() для объединения CSS-классов
│
├── hooks/
│   ├── use-mobile.ts        # Хук определения мобильного экрана
│   └── use-toast.ts         # Хук для toast-уведомлений
│
├── styles/
│   └── globals.css          # Вторичный CSS (не используется, основной в app/)
│
├── next.config.mjs          # Конфиг Next.js: images.unoptimized, ignoreBuildErrors
├── tsconfig.json            # TypeScript конфиг с path alias @/*
├── postcss.config.mjs       # PostCSS с Tailwind v4 плагином
├── components.json          # shadcn/ui конфигурация
└── package.json             # Зависимости и скрипты
```

---

## 5. Архитектура приложения

### 5.1 Точка входа и рендеринг

```
app/layout.tsx (Server Component)
  └── app/page.tsx ("use client")
        └── <AppLayout /> (components/app-layout.tsx)
              ├── Hydration Guard (пустой экран до инициализации store)
              ├── Auth Gate (показ AuthScreen если не авторизован)
              └── Tab Router:
                    ├── <ChatScreen />        (tab: "chat")
                    ├── <WardrobeScreen />    (tab: "wardrobe")
                    ├── <CollectionsScreen /> (tab: "collections")
                    └── <ProfileScreen />     (tab: "profile")
              └── <BottomNav /> (fixed bottom, h-[70px])
```

**Важно:** Все приложение работает на одном маршруте `/`. Навигация между экранами реализована через состояние `activeTab` в Zustand store, а не через Next.js routing.

### 5.2 Управление состоянием (Zustand Store)

Файл: `lib/store.ts`

Единый store содержит ВСЕ состояние приложения. Используется `zustand/middleware/persist` для сохранения в localStorage под ключом `"stylistai-storage"`.

**Секции стейта:**

| Секция | Поля | Описание |
|---|---|---|
| **Auth** | `user`, `isAuthenticated`, `login()`, `logout()`, `updateUserFit()` | Авторизация (mock, всегда успешна с задержкой 800ms) |
| **Theme** | `theme`, `setTheme()` | "dark" / "light", применяет класс `.dark` на `<html>` |
| **Navigation** | `activeTab`, `setActiveTab()` | Текущая вкладка: "chat" / "wardrobe" / "collections" / "profile" |
| **Wardrobe** | `wardrobeItems[]`, `wardrobeFilter`, `wardrobeFavorites[]`, `addWardrobeItem()`, `removeWardrobeItem()`, `toggleWardrobeFavorite()` | Управление гардеробом |
| **Collections** | `savedOutfits[]`, `collectionsFilter`, `saveOutfit()`, `saveOutfitFromSuggestion()`, `removeOutfit()`, `toggleOutfitFavorite()` | Сохраненные образы |
| **Chat** | `chatSessions[]`, `activeSessionId`, `messages[]`, `isAiTyping`, `evaluatedOutfits` (Set), `addMessage()`, `clearChat()`, `markOutfitAsEvaluated()` | Чат с AI |

**Что сохраняется в localStorage (partialize):**
- `user`, `isAuthenticated`, `theme`
- `wardrobeItems`, `wardrobeFavorites`
- `savedOutfits`
- `chatSessions`, `activeSessionId`

**Что НЕ сохраняется:**
- `evaluatedOutfits` (Set) - сбрасывается при перезагрузке
- `messages` - восстанавливаются из `chatSessions` при загрузке
- `isAiTyping` - сбрасывается

**Инициализация:**
Метод `initializeStore()` вызывается один раз в `AppLayout` через `useEffect`. Если данных нет, загружаются моки из `mock-data.ts`.

### 5.3 Система типов

Файл: `lib/types.ts`

```typescript
// Основные сущности
interface User              // id, name, email, avatar, height, size, shoeSize
interface ClothingItem      // id, name, brand, category, imageUrl, tags[], color, price, buyLink, createdAt
interface OutfitSuggestion  // id, name, items[], style
interface Outfit            // id, name, items[], occasion, tags[], createdAt, isFavorite
interface ChatMessage       // id, content, sender, timestamp, attachments?, suggestedItems?, outfitSuggestions?
interface ChatSession       // id, title, messages[], createdAt, updatedAt

// Перечисления
type ClothingCategory = "all" | "tops" | "bottoms" | "shoes" | "accessories" | "outerwear"
type ClothingTag = "casual" | "formal" | "summer" | "winter" | "spring" | "autumn" | "sport" | "business" | "date" | "travel"
type Tab = "chat" | "wardrobe" | "collections" | "profile"
type Theme = "dark" | "light"
type CollectionFilter = "all" | "business" | "date" | "casual" | "travel"

// Константы с русскими метками
CATEGORY_LABELS: Record<ClothingCategory, string>       // "Все", "Верх", "Низ"...
COLLECTION_FILTER_LABELS: Record<CollectionFilter, string> // "Все", "Бизнес"...
QUICK_ACTIONS                                            // Быстрые действия чата
```

---

## 6. Экраны приложения (подробно)

### 6.1 AuthScreen (`components/screens/auth-screen.tsx`)

**Функционал:** Форма входа/регистрации (mock).

- Два режима: `"login"` и `"register"` (переключение кнопкой внизу)
- Поля: Имя (только для регистрации), Email, Пароль
- Кнопка показать/скрыть пароль
- Валидация: имя непустое (регистрация), email непустой, пароль >= 4 символов
- `login()` всегда успешен с задержкой 800ms
- При успехе: store получает mock-пользователя с данными из `mockUser`

### 6.2 ChatScreen (`components/screens/chat-screen.tsx`)

**Функционал:** Чат с AI-стилистом.

**Структура layout:**
```
[Header]          - fixed, h-12, аватар AI + статус "Online"
[Messages Area]   - flex-1, overflow-y-auto, min-h-0
[Composer]        - flex-shrink-0, mb-[70px] (отступ для bottom nav)
  ├── Quick Buttons  (4 кнопки: Повседневный, Вечерний, Спорт, Офис)
  ├── Image Preview  (если фото загружено)
  └── Input Area     (кнопка фото, текстовый ввод, кнопка отправки)
```

**Ключевые подкомпоненты:**

1. **TextBubble** - Пузырь сообщения
   - User: `bg-violet-600 text-white`, выравнивание вправо
   - AI: `bg-secondary text-secondary-foreground`, выравнивание влево
   - Поддержка вложений (фото): `<img>` внутри пузыря с aspect-ratio 3:4
   - Max-width: 75%

2. **OutfitCarousel** - Карусель предложенных образов
   - Embla Carousel (горизонтальный свайп)
   - Каждый слайд: карточка образа с названием, стилем, списком вещей (фото + бренд + цена), общей суммой
   - Кнопки: "Пропустить" (X) и "Сохранить" (Heart)
   - Pagination dots внизу
   - При сохранении: `saveOutfitFromSuggestion()` + `markOutfitAsEvaluated()`
   - При пропуске: `markOutfitAsEvaluated()` + переход к следующему слайду

3. **TypingIndicator** - Три анимированных точки

**Система сообщений (FlatMessageItem):**
Сообщения из store преобразуются в плоский список для рендеринга:
- `TEXT` - обычный текстовый пузырь (с возможными вложениями-фото)
- `OUTFIT_GROUP` - карусель образов (фильтруются уже оцененные через `evaluatedOutfits`)

Когда все образы в группе оценены, вместо карусели показывается текстовое сообщение "Вы оценили все предложенные образы!"

**Генерация AI-ответов:**
Файл `lib/mock-data.ts`, функция `generateMockAIResponse()`:
- Простой keyword-matching по тексту пользователя
- Ключевые слова: "офис/работ/деловой", "свидани/вечер/ресторан", "спорт/трениров"
- Всегда возвращает `OutfitSuggestion[]` (2-3 образа из mock-данных)
- Задержка ответа: 1500-2500ms (random)

**Отправка фото:**
- `ImageUploadInput` (variant="icon") в composer
- Фото конвертируется в Data URL через FileReader
- Хранится в `ChatMessage.attachments[]` как строка base64
- Отображается в TextBubble как `<img>` (не next/image, т.к. data URL)

### 6.3 WardrobeScreen (`components/screens/wardrobe-screen.tsx`)

**Функционал:** Каталог вещей пользователя.

**Структура layout:**
```
[Header]          - sticky top-0, заголовок + кнопка фильтров
  ├── Category Tabs   (Все, Верх, Низ, Обувь, Верхняя одежда, Аксессуары)
  └── Filters Panel   (опционально: Стиль, Сезон, Цвет + кнопка сброса)
[Grid]            - 3 колонки, overflow-y-auto
  ├── Item Cards      (фото + звезда избранного + название)
  └── Add Button      (серый квадрат с "+")
[Item Detail Sheet]   (Sheet/drawer снизу при клике на вещь)
[AddItemDialog]       (Dialog при клике на "+")
```

**Фильтрация (useMemo):**
1. По категории (`wardrobeFilter`)
2. По стилю (Casual/Sport/Evening/Office) - проверка `tags[]`
3. По сезону (Весна/Лето/Осень/Зима) - маппинг русских названий в английские теги
4. По цвету - проверка `item.color`
5. Сортировка: избранные (wardrobeFavorites) всегда сверху

**Карточка вещи:**
- `<div>` с `onClick` для открытия Sheet
- Aspect-ratio: square
- Кнопка-звезда (избранное): `<button>` внутри div (не nested button)
- Желтая звезда = избранное, полупрозрачная = нет

**Детали вещи (Sheet):**
- Большое фото (aspect-square)
- Бренд, название, цена
- Теги (Badge компоненты)
- Кнопки: "Создать образ с этой вещью" (переход в чат), Редактировать (заглушка), Удалить

**Добавление вещи (AddItemDialog):**
- Загрузка фото (ImageUploadInput)
- Поля: Название*, Бренд* (с автодополнением из списка REAL_BRANDS), Цена*, Категория, Цвет, Стиль, Сезон
- При сабмите: создается `ClothingItem` с уникальным id (`item-${Date.now()}`), добавляется через `addWardrobeItem()`
- Категория "all" автоматически заменяется на "tops"
- Теги генерируются из выбранных стиля и сезона

### 6.4 CollectionsScreen (`components/screens/collections-screen.tsx`)

**Функционал:** Сохраненные образы.

**Структура layout:**
```
[Header]          - sticky top-0, заголовок + счетчик образов
  └── Filter Chips   (Все, Бизнес, Свидание, Повседневный, Путешествие)
[Grid]            - 2 колонки, overflow-y-auto
  └── OutfitCard     (коллаж фото + название + теги)
[Outfit Detail Sheet] (Sheet снизу при клике на карточку)
```

**OutfitCard (`components/outfit-card.tsx`):**
- Коллаж: grid 2x2 из первых 4 вещей образа (фото через next/image)
- Кнопка избранного (сердце) в правом верхнем углу
- Название, occasion, теги (макс 2 + "+N")
- Кнопка "Удалить"

**Детали образа (Sheet):**
- Название образа
- Дата создания (русская локаль)
- Теги (occasion + tags)
- Список вещей: фото (w-20 h-20) + название + бренд + цена
- Общая стоимость образа
- Кнопки: "В избранное" / "В избранном" + Удалить

**Сортировка:** Избранные первыми, затем по дате (новые первыми).

### 6.5 ProfileScreen (`components/screens/profile-screen.tsx`)

**Функционал:** Профиль пользователя и настройки.

**Компоненты:**
- Аватар + имя + email
- Карточка "Мои параметры" (рост, размер одежды, размер обуви) с кнопкой редактирования
- Статистика: количество вещей и образов (из store)
- Настройки: Уведомления (заглушка), Тема (Switch dark/light)
- Кнопка "Выйти"

**Редактирование параметров:**
- Dialog с полями: Рост (number), Размер (text), Обувь (number)
- Сохранение через `updateUserFit()`
- Данные обновляются в `user` объекте в store

---

## 7. Система стилей и тем

### 7.1 Tailwind CSS v4

Конфигурация в `app/globals.css` (НЕ в tailwind.config.js - его нет в v4).

**CSS-переменные для тем:**
- Light theme: `:root { ... }` - светлый фон, темный текст
- Dark theme: `.dark { ... }` - темный фон (oklch(0.145 0 0)), светлый текст

**Ключевые токены:**
- `--background` / `--foreground` - основные цвета
- `--primary` / `--primary-foreground` - акцентный цвет
- `--secondary` / `--secondary-foreground` - вторичный цвет
- `--muted` / `--muted-foreground` - приглушенные элементы
- `--card` / `--card-foreground` - карточки
- `--border`, `--input`, `--ring` - границы и фокус
- `--destructive` - деструктивные действия (удаление)

**Шрифты:** Geist (sans) + Geist Mono (mono), подключены через `next/font/google`.

### 7.2 Переключение темы

- По умолчанию: `"dark"`
- Переключение: `setTheme()` в store добавляет/убирает класс `.dark` на `document.documentElement`
- При инициализации: `initializeStore()` применяет сохраненную тему

### 7.3 Кастомные стили

В `globals.css`:
- Кастомный скроллбар (webkit + Firefox): тонкий, цвет `muted-foreground`, hover -> `foreground`
- Класс `.press-effect` (не определен в CSS, предполагается через inline transition)

---

## 8. Мок-данные

Файл: `lib/mock-data.ts`

**Пользователь (`mockUser`):**
- Имя: Александра, email: alex@example.com
- Аватар: Unsplash фото
- Параметры: рост 172, размер M, обувь 38

**Вещи (`mockClothingItems`):** 12 предметов одежды
- Бренды: COS, Levi's, AllSaints, Nike, Massimo Dutti, Zara, Jimmy Choo, Acne Studios, Max Mara, Saint Laurent, Uniqlo, Reformation
- Категории: tops (4), bottoms (3), shoes (2), outerwear (2), accessories (1)
- Цены: от 2490 до 129990 RUB
- Фото: Unsplash URL

**Образы (`mockOutfits`):** 3 образа
- "Деловая встреча" (Офис, business/formal, избранный)
- "Городская прогулка" (Прогулка, casual/spring)
- "Романтический ужин" (Свидание, date/formal, избранный)

**Предложения AI (`mockOutfitSuggestions`):** 3 варианта
- "Повседневный шик" (Casual)
- "Деловой образ" (Smart)
- "Спортивный лук" (Sport)

**Начальные сообщения чата (`initialChatMessages`):** 3 сообщения
- Приветствие AI
- Запрос пользователя "Подбери мне образ на выходные"
- Ответ AI с outfitSuggestions (карусель)

---

## 9. Компоненты UI (shadcn/ui)

Проект использует ~50 компонентов из shadcn/ui, расположенных в `components/ui/`.

**Активно используемые в приложении:**
- `Button` - кнопки (варианты: default, outline, destructive, ghost)
- `Input` - текстовые поля
- `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogFooter` - модальные окна
- `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle` - выдвижные панели (bottom)
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` - выпадающие списки
- `Badge` - теги/метки
- `Switch` - переключатель (тема)
- `Carousel` / `CarouselContent` / `CarouselItem` - карусель (Embla)
- `Tabs` - вкладки
- `Avatar` - аватар пользователя
- `Separator` - разделители

**Особенности:**
- `Dialog` имеет `aria-describedby={undefined}` на `DialogContent` для подавления accessibility-предупреждений
- Все компоненты используют `class-variance-authority` (cva) для вариантов
- Стили основаны на CSS-токенах (bg-background, text-foreground и т.д.)

---

## 10. Важные паттерны и особенности

### 10.1 Hydration Guard
В `AppLayout` есть защита от мисматча гидрации:
```tsx
const [isHydrated, setIsHydrated] = useState(false);
useEffect(() => { initializeStore(); setIsHydrated(true); }, []);
if (!isHydrated) return <div className="w-full h-screen bg-background" />;
```

### 10.2 Bottom Nav Offset
Нижняя навигация (`BottomNav`) - `fixed bottom-0`, высота `h-[70px]`. Все экраны учитывают это:
- Wardrobe, Collections, Profile: `pb-[70px]`
- Chat: composer имеет `mb-[70px]`

### 10.3 Загрузка изображений
Компонент `ImageUploadInput`:
- Два варианта: `"icon"` (круглая кнопка) и `"button"` (кнопка с текстом)
- Три размера: `"sm"`, `"md"`, `"lg"`
- Принимает только изображения (`accept="image/*"`)
- Конвертирует в Data URL через FileReader
- Возвращает `(file: File, preview: string)` через колбэк

### 10.4 Оцененные образы
`evaluatedOutfits` (Set) хранит ID образов, которые пользователь оценил (сохранил или пропустил) в чате. При рендеринге карусели оцененные фильтруются. Set сбрасывается при перезагрузке страницы (не сохраняется в localStorage).

### 10.5 Next.js конфигурация
```js
// next.config.mjs
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```
- TypeScript ошибки игнорируются при билде
- Изображения не оптимизируются (unoptimized: true) - все через Unsplash или Data URL

### 10.6 Path Aliases
`tsconfig.json`: `"@/*": ["./*"]` - импорты вида `@/components/...`, `@/lib/...`

---

## 11. Потоки данных (Data Flows)

### 11.1 Добавление вещи в гардероб
```
User clicks "+" -> setShowAddDialog(true)
  -> AddItemDialog opens
  -> User fills form (name, brand, price, category, photo, etc.)
  -> handleSubmit()
    -> Creates ClothingItem object with id: `item-${Date.now()}`
    -> addWardrobeItem(newItem) -> Zustand: prepends to wardrobeItems[]
    -> Reset form, close dialog
    -> wardrobeItems updates -> useMemo recalculates filteredItems -> grid re-renders
```

### 11.2 Отправка сообщения в чат
```
User types message or clicks Quick Button
  -> handleSend(text)
    -> addMessage({ sender: "user", content, attachments? })
    -> setAiTyping(true)
    -> wait 1500-2500ms (fake delay)
    -> generateMockAIResponse(content) -> returns ChatMessage with outfitSuggestions
    -> addMessage(aiResponse)
    -> setAiTyping(false)
    -> flatMessages recalculated -> UI re-renders with new bubbles + carousel
```

### 11.3 Сохранение образа из чата
```
User swipes carousel -> clicks "Сохранить"
  -> handleSaveOutfit(suggestion)
    -> markOutfitAsEvaluated(suggestion.id) -> adds to evaluatedOutfits Set
    -> saveOutfitFromSuggestion(suggestion) -> creates Outfit, prepends to savedOutfits[]
    -> Carousel re-renders (filters out evaluated outfit)
    -> Outfit appears in Collections tab
```

### 11.4 Авторизация
```
User enters email + password -> handleSubmit()
  -> login(email, password) -> 800ms delay -> sets user + isAuthenticated = true
  -> AppLayout re-renders -> auth gate passes -> shows main app
  -> initializeStore() loads mock data if empty
```

---

## 12. Известные ограничения

1. **Нет бэкенда** - все данные в localStorage, при очистке браузера данные теряются
2. **Mock AI** - ответы генерируются по ключевым словам, нет реального AI
3. **Mock авторизация** - любой email/пароль (>= 4 символа) принимается
4. **Нет валидации Zod** - библиотека подключена, но формы валидируются вручную
5. **Фото хранятся как Data URL** - при большом количестве фото localStorage может переполниться (~5-10MB лимит)
6. **Один маршрут** - вся навигация клиентская через состояние, нет deep linking
7. **Нет i18n** - интерфейс на русском, но теги/стили на английском (casual, formal и т.д.)
8. **images.unoptimized** - Next.js Image Optimization отключена
9. **Кнопка "Редактировать"** в деталях вещи - заглушка (ничего не делает)
10. **Кнопка "Уведомления"** в профиле - заглушка
