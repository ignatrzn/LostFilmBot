process.env.NTBA_FIX_319 = 1

const cheerio = require('cheerio')
const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
const request = require('request')
const { flatten } = require('ramda')

const { RSS_URL } = require('./common/constants')
const { MAIN_MENU } = require('./common/keyboards')
const { query } = require('./db')

const APP_URL = process.env.APP_URL
const BOT_TOKEN = process.env.BOT_TOKEN

const options = {
  onlyFirstMatch: true,
  webHook: {
    port: process.env.PORT,
  },
}

const bot = new TelegramBot(BOT_TOKEN, options)

bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`)

const flatMainMenu = flatten(MAIN_MENU.reply_markup.keyboard)

const getRSS = chatId => {
  const opts = {
    parse_mode: 'HTML',
    chat_id: chatId,
    disable_web_page_preview: true,
  }

  request(RSS_URL, (error, response, body) => {
    if (!error) {
      let message = ''
      let $ = cheerio.load(body, {
        ignoreWhitespace: false,
        normalizeWhitespace: true,
        xmlMode: true,
      })

      const publishDate = new Date($('lastBuildDate').text())
      message += `📅 ${moment(new Date(publishDate)).format('LLL')} 📅\n\n`

      $('item').each(function() {
        message += `🎬 <b>${$('title', this).text()}</b>\n<pre>📅 ${moment($('pubDate', this).text()).format(
          'LLL',
        )}</pre>\n🔗 <a href="${$('link', this).text()}">Ссылка</a>\n\n`
      })

      bot.sendMessage(chatId, message, opts)
    } else {
      console.log('Произошла ошибка: ' + error)
    }
  })
}

bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id

  const {
    date,
    from: { id, first_name, last_name, username, language_code, is_bot },
  } = msg

  query(
    'INSERT INTO users(id, first_name, last_name, username, language_code, is_bot, date) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;',
    [id, first_name, last_name, username, language_code, is_bot, date],
  ).catch(e => console.error(e.stack))

  const response = `
  🎉 Добро пожаловать!!! 🎉
  Я - бот, который поможет Вам быть в курсе выхода новых серий на сайте
  🙈 http://www.lostfilm.tv 🙉
  Для начала работы, используйте команду
  🍽 /menu`

  bot.sendMessage(chatId, response)
})

bot.onText(/\/menu/, msg => {
  bot.sendMessage(msg.from.id, '🍽 Меню:', MAIN_MENU)
})

bot.on('message', msg => {
  const chatId = msg.chat.id
  if (msg.text === flatMainMenu[0]) {
    getRSS(chatId)
  }
})

bot.on('polling_error', error => {
  console.error(error.stack)
})
