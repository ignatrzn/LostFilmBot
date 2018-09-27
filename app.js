process.env.NTBA_FIX_319 = 1

const cheerio = require('cheerio')
const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
const request = require('request')
const { flatten } = require('ramda')

const { RSS_URL } = require('./common/constants')
const { MAIN_MENU, SUBSCRIPTION_MENU, TIME } = require('./common/keyboards')
const { query } = require('./db')

const APP_URL = process.env.APP_URL
const BOT_TOKEN = process.env.BOT_TOKEN

const options = {
  webHook: {
    port: process.env.PORT,
  },
}

const bot = new TelegramBot(BOT_TOKEN, options)

bot.setWebHook(`${APP_URL}/bot${BOT_TOKEN}`)

const flatMainMenu = flatten(MAIN_MENU.reply_markup.keyboard)
const flatSubscriptionMenu = flatten(SUBSCRIPTION_MENU.reply_markup.keyboard)

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
  } else if (msg.text === flatMainMenu[1]) {
    query('SELECT id, user_id, chat_id, time FROM public.schedules where user_id=$1', [msg.from.id])
      .then(result => {
        if (result.rowCount) {
          bot.sendMessage(msg.chat.id, 'Вы будете получать RSS ежедневно в:', SUBSCRIPTION_MENU).then(() => {
            result.rows.map(row => {
              const options = {
                parse_mode: 'Markdown',
                disable_notification: true,
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [
                      {
                        text: '➖ Удалить➖ ',
                        callback_data: JSON.stringify({ type: 'unsubscribe', payload: row.id }),
                      },
                    ],
                  ],
                }),
              }
              bot.sendMessage(msg.chat.id, `🕒 *${row.time}*`, options)
            })
          })
        } else {
          bot.sendMessage(msg.chat.id, 'Вы не подписаны на ежедневное получение RSS', SUBSCRIPTION_MENU)
        }
      })
      .catch(e => console.error(e.stack))
  } else if (msg.text === flatSubscriptionMenu[0]) {
    bot.sendMessage(msg.chat.id, 'Пожалуйста, выберите время', TIME)
  } else if (msg.text === flatSubscriptionMenu[1]) {
    bot.sendMessage(msg.from.id, '🍽 Меню:', MAIN_MENU)
  } else {
    bot.sendMessage(msg.from.id, '‿( ́ ̵_-`)‿', MAIN_MENU)
  }
})

bot.on('callback_query', msg => {
  const {
    id,
    from: { id: user_id },
    message: {
      chat: { id: chat_id },
    },
  } = msg

  const { type, payload } = JSON.parse(msg.data)

  if (type === 'subscribe') {
    query(`INSERT INTO schedules(id, user_id, chat_id, time) VALUES(nextval('schedules_ids'), $1, $2, $3)`, [
      user_id,
      chat_id,
      payload,
    ])
      .then(res => {
        if (res.rowCount) {
          bot.sendMessage(chat_id, `Вы будете получать RSS в 🕒 *${payload}*`, SUBSCRIPTION_MENU)
        }
      })
      .catch(e => console.error(e.stack))
  } else if (type === 'unsubscribe') {
    query(`DELETE from schedules WHERE id = $1 RETURNING time`, [payload])
      .then(res => {
        if (res.rowCount) {
          bot.sendMessage(chat_id, `Вы больше не будете получать RSS в 🕒 *${res.rows[0].time}*`, SUBSCRIPTION_MENU)
        }
      })
      .catch(e => console.error(e.stack))
  }
  bot.answerCallbackQuery(id, { text: 'Готово!' }, false)
})

bot.on('polling_error', error => {
  console.error(error.stack)
})

setInterval(() => {
  query('SELECT chat_id, time FROM public.schedules').then(result => {
    if (result.rowCount) {
      result.rows.map(row => {
        if (new Date().toLocaleTimeString().slice(0, 5) === row.time.slice(0, 5)) {
          getRSS(row.chat_id)
        }
      })
    }
  })
}, 1000 * 60)
