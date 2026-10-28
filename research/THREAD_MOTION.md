# «Потяни за связь» — физический шнур, версия 2

Оживлена сцена «Связь» на главной. Прокрутка и I NEED / I OFFER задают натяжение. Круглый конец можно потянуть мышью и отпустить; обычный клик и Enter ведут в выбранный сценарий с сохранением языка.

## Изменение принципа

В первой версии деформировался участок единой иллюстрации. Во второй бумага и золото неподвижны, а шнур рисуется отдельной лентой с постоянным сечением и фактурой, взятой из исходного `connection.webp`. Основная нить состоит из 116 физических точек, со связями по длине и ограничением изгиба. Фиксированный шаг 1/120 секунды, затухание и ограничения передают движение от конца к слабине. Для отрисовки кривая дополнительно сглаживается, чтобы на поворотах не появлялись углы.

Тень рисуется отдельными мягкими проходами; у пересечения выходящий участок лежит над возвращающейся петлёй. Кольцо и узел остаются фрагментами исходной иллюстрации и перемещаются как жёсткая деталь. Свободный завиток имеет отдельный затухающий отклик и округлённое окончание.

`connection.webp` не изменён. Для удаления неподвижной старой нити используется новая подложка `public/assets/editorial/connection-clean-v2.webp`. Она смешивается с исходной иллюстрацией только в узкой маске вокруг старого шнура и его тени. Остальная композиция берётся из оригинала.

## Файлы и поведение

- `src/components/thread-physics.ts`: исходная трассировка, ограничения длины/изгиба, инерция, засыпание, положение жёсткого конца и прежняя мобильная обрезка.
- `src/components/thread-renderer.ts`: неподвижная подложка, исходное плетение, сглаженные ленты, контактные тени и порядок слоёв.
- `src/components/ConnectionThread.tsx`: ленивое включение, прокрутка, перетягивание с pointer capture, фокус, ссылка и полный cleanup.

При reduced motion, ошибке загрузки подложки или недоступном/потерянном WebGL остаётся исходная иллюстрация и обычная ссылка. На мобильном скрытый обрезкой конец исключён из навигации, видимая петля реагирует на прокрутку. Неактивная сцена и скрытая вкладка не обновляются; успокоившаяся модель засыпает. Разрешение ограничено DPR 2 и шириной 2560 пикселей. Проверочные data-атрибуты состояния физики присутствуют только в dev-сборке.

## Проверка — 28 октября 2026

Production client/SSR build и prerender 28 маршрутов EN/RU прошли. Все 54 теста прошли. Шесть тестов физики проверяют неподвижное крепление, соединение с кольцом, отклонение длины отдельных участков меньше 1% в максимальном режиме, отсутствие резких заломов при плавном натяжении и отпускании, инерцию/засыпание, согласованность 30/60/120 Hz и мобильное кадрирование.

В браузере проверены перетягивание с отпусканием без перехода по ссылке, переход с клавиатуры, I NEED / I OFFER, изменение размеров без перезагрузки и мобильная композиция. Счётчик кадров в dev подтвердил остановку в покое. Через удалённый после проверки локальный стенд проверены reduced motion до инициализации графики и возврат исходной картинки после реальной потери WebGL-контекста. Запись: `thread-motion/thread-physics-v2.gif`; снимки: `thread-motion/desktop-v2.png` и `thread-motion/mobile-v2.png`. Публикация на production не выполнялась.

## Подготовка подложки

Использован встроенный инструмент `imagegen`, режим precise-object-edit, opaque background. Сгенерированный PNG 1584 × 993 сохранён инструментом в `/Users/mac/.codex/generated_images/01a181a8-8c0d-7540-a798-cb1f0b8346d4/exec-13c819fd-4600-4b91-a254-f0db87b099f5.png`. Рабочая WebP-копия — `public/assets/editorial/connection-clean-v2.webp`; при локальном смешивании она совмещается с исходными координатами 1586 × 992. Исходный файл инструмента сохранён.

Полный использованный промпт:

> Use case: precise-object-edit. Image 1 is the EDIT TARGET, a website illustration measuring 1586 by 992. Produce an exactly registered clean background plate for animation compositing. Remove ONLY the entire hot pink loose cord outside the gold spool, including its large loop, short upward curled tail, little knot, circular black-and-pink end ring, and ALL their contact shadows on the paper. Reconstruct the warm ivory textured paper underneath seamlessly with matching illumination and fine paper grain. Keep the character, black frame, gold spool, engraved V, every gold edge and shadow, perspective, framing, colors, canvas dimensions and placement exactly unchanged. The pink cord wound INSIDE the gold spool must stay. Also remove the diagonal cord that starts at the central black hole of the gold V spool, restoring the gold engraving behind its portion over the spool, and leave the central black hole itself unchanged. No loose pink cord anywhere outside the spool. Do not add objects, letters, lines, labels, frames, blur or new composition. Exact original 1586:992 composition, no zoom, no crop. This is a background-only layer, not a new illustration.
