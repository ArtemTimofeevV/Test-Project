import telebot
from env import token
from telebot import types

token = token.get("BOT_API_TOKEN")
bot = telebot.TeleBot(token)

@bot.message_handler(commands=['start'])
def start_message(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    start_button = types.KeyboardButton("Старт")
    action_button = types.KeyboardButton("Комплимент")
    markup.add(start_button, action_button)
    bot.send_message(message.chat.id, text="Привет, {0.first_name} \nМеня зовут @Francesco_Datini_Bot\nДавай начнём работу.".format(message.from_user), reply_markup=markup)

@bot.message_handler(content_types=['text'])
def buttons(message):
    if (message.text == "Старт"):
        bot.send_message(message.chat.id, text="Как тебя зовут?")
    else:
        bot.send_message(message.chat.id, text="Прости, но я могу отвечать только на нажатие кнопок")

bot.polling(none_stop=True, interval=0)
