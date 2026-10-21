# PAN — обработка исходных изображений

Использован встроенный ImageGen. Исходники владельца сохранены без изменений. Новые версии предназначены для сборки интерфейса из прозрачного предметного слоя, общей атмосферы, теней и отражений.

## Промпты

### 1. pan_core_cutout_v2

Исходники: `/Users/mac/Documents/PAN :/king traffic.PNG`

Прозрачность: да, настоящий alpha-канал.

```text
Use case: background-extraction. Asset type: production website hero object with genuine transparent alpha background. Image 1 is the EDIT TARGET, the owner's supplied king traffic artwork. Carefully extract and art-direct its existing central crowned server network into one clean, coherent freestanding object. Preserve the exact recognizable gold cracked crown and its black crown emblem, black fractured basalt server towers, hot pink #ff0077 energy conduits, fine molten gold seams, pink drips, three-quarter camera angle and premium dark material rendering. Keep the central crowned tower plus the four smaller connected servers on a compact broken-stone island; shorten only the sprawling outer ground so the silhouette reads clearly as a single object at website sizes. Remove the entire black rectangular background, distant ground, smoke clouds, scattered background rubble and loose peripheral particles. Retouch edge contamination, clean up silhouette and fine cables. Relight with a restrained cool graphite rim from upper left and crisp pink underlighting, detailed metallic gold highlights; retain deep blacks and avoid blown out neon. Full object visible including crown tips and outer server corners with 8% transparent breathing room on all sides. The result must be a real RGBA cutout, not a black or checkerboard background and not a scene in a frame. No humanoid, no mascot, no face, no hands, no added symbols, no typography, no new logo. Do not create a website mockup. This is a refined cutout of the owner's original object for compositing behind real HTML glass controls.
```

### 2. pan_atmosphere_v2

Исходники: `/Users/mac/Documents/PAN :/pan background #4.PNG`, `/Users/mac/Documents/PAN :/pan background #5.PNG`

Прозрачность: нет.

```text
Use case: compositing. Asset type: one coherent atmospheric background plate for an existing dark glass website, wide landscape about 2:1. Images 1 and 2 are the owner's source materials to EDIT and COMPOSITE, not rectangular pictures to show inside the output. Rework their black fractured volcanic stone, fine gold veins, liquid hot-pink #ff0077 fissures, dark reflections and sparse smoke into a deliberately composed premium background. Remove the large central architectural block, portal, graffiti and any lettering from image 1; use its stone facets, subtle smoke and material light instead. Use the low cracked ground of image 2 as the base, retouch repetitive rubble and excess pink paint. The lower quarter contains a shallow sculpted obsidian ledge, with one elegant branching pink-lit fault running from lower left toward lower middle; a few thin gold seams and localized pink reflections illuminate the bevels. The upper two thirds are deep near-black graphite negative space, with subtle soft smoke near outer left and right edges, no large clouds through the middle. Match a restrained cool soft rim from upper left and pink underlight so a separately composited gold-crowned server object will belong naturally around the left third of the canvas. Keep the right half particularly quiet for data widgets; preserve a soft pink glow from below without a big pink blob. Unify perspective, contrast, colour grading and grain across the full canvas; make all outer edges fade naturally into near-black #0b0c12 with no visible frame, boxed photo, border, seam or vignette circle. Detailed realistic basalt and warm metallic gold, more carefully art-directed and less noisy than the sources. No servers, no crown object, no humanoid, no mascot, no faces, no labels, no text, no UI panels, no charts, no button graphics; the interface will be actual HTML.
```


## Сохранённые результаты

- `research/artwork/pan-core-cutout-v2.png` — результат встроенного ImageGen, 1089 × 1445, RGBA. Проверен alpha-канал от 0 до 255; угловой пиксель полностью прозрачен.
- `research/artwork/pan-atmosphere-v2.png` — результат встроенного ImageGen, 1774 × 887, RGB.
- `public/assets/pan-core-cutout-v2.webp` — веб-версия с сохранённой прозрачностью.
- `public/assets/pan-atmosphere-v2.webp` — общая веб-атмосфера и изображение для превью ссылок.

Обработка исходников выполнена встроенным ImageGen. Python/Pillow использован после обработки только для чтения метаданных и кодирования WebP; фон и предмет не вырезались алгоритмически.

## Проверка интеграции

- Проверены главная страница на 1440, 390 и 320 px, переключение RU/EN, выбор роли и переход к заявке с соответствующим параметром.
- Проверена партнёрская обложка на 320 px: прозрачный объект целиком помещается в контейнер; горизонтального переполнения нет.
- В консоли браузера нет предупреждений и ошибок; изображения загружены. Веб-версия предмета сохраняет настоящий alpha-канал.
- Сборка создаёт 23 страницы; все 16 существующих тестов проходят.
- Итоговые скриншоты: `../PAN-art-directed-desktop.png`, `../PAN-art-directed-mobile.png`.
