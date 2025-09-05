Установка

1. Клонируйте репозиторий:
	cd (папка куда решите выгрузить проект)
	git clone https://github.com/ArtemIDv/Test-Project

2. Установите зависимости:
	npm install

3. Настройте БД:
	Откройте файл `src/data-source.ts` и введите свои учетные данные для подключения к базе данных (имя пользователя, пароль, имя базы данных).

     export const AppDataSource = new DataSource({
         type: "postgres",
         host: "localhost",
         port: 5432,
         username: "your_username",                                                     <-----     Замените на ваше имя пользователя
         password: "your_password",                                                     <-----     Замените на ваш пароль
         database: "your_database",                                                     <-----     Замените на имя вашей базы данных
         synchronize: true, // В режиме разработки можно оставить true
         logging: false,
         entities: [__dirname + "/entities/**/*.{ts,js}"],
         migrations: [],
         subscribers: [],
     })

Запуск приложения

Чтобы запустить приложение в режиме разработки, выполните команду:

npm start

Сервер будет запущен по адресу `http://localhost:3000`.

Сборка проекта

Для сборки проекта в JavaScript выполните команду:

npm run build

Собранные файлы появятся в папке `dist`.

API Документация

После запуска сервера, документация Swagger будет доступна по адресу:

http://localhost:3000/api-docs

Тестирование

Вы можете использовать Postman или любой другой инструмент для тестирования API. Отправляйте запросы на эндпоинты, описанные в документации Swagger.
