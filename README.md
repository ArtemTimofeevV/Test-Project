API для E-commerce платформы

Простое API для тестового проекта E-commerce.

---

# Быстрый старт

## Требования

-   [Node.js](https://nodejs.org/) (версия LTS)
-   [PostgreSQL](https://www.postgresql.org/)

## 1. Клонирование репозитория

В любой консоли вводите следующее:

1) git clone https://github.com/ArtemIDv/Test-Project
2) cd Test-Project


## 2. Установка зависимостей

В любой консоли, по располажнию проекта, вводите следующее:
npm install

## 3. Настройка окружения

Создайте файл с именем `.env` в папке проекта и добавьте в него следующие переменные. Замените значения на ваши данные для подключения к PostgreSQL.

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres                                <---- Сменить на Ваш username
DB_PASSWORD=your_password                           <---- Сменить на Ваш password
DB_DATABASE=postgres                                <---- Сменить на Ваш database

## 4. Запуск приложения

В любой консоли, по располажнию проекта, вводите следующее:
npm start

Сервер запустится по адресу `http://localhost:3000`.

## 5. Документация API

Документация Swagger UI доступна по адресу:
`http://localhost:3000/api-docs`

______________________________________________________________________________________________________________________________________

API for the E-commerce platform

A simple API for an E-commerce test project.

---

# Quick start

## Requirements

- [Node.js ](https://nodejs.org /) (LTS version)
- [PostgreSQL](https://www.postgresql.org /)

## 1. Cloning a repository

In any console, enter the following:

1) git clone https://github.com/ArtemIDv/Test-Project
2) cd Test-Project


## 2. Installing dependencies

In any console, at the location of the project, enter the following:
npm install

##3. Setting up the environment

Create a file named `.env` in the project folder and add the following variables to it. Replace the values with your data for connecting to PostgreSQL.

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres      <---- Change to your username
DB_PASSWORD=your_password <---- Change to your password
DB_DATABASE=postgres      <---- Change to your database

##4. Launching the app

In any console, at the location of the project, enter the following:
npm start

The server will start at `http://localhost:3000 `.

## 5. API Documentation

The Swagger UI documentation is available at:
`http://localhost:3000/api-docs`
