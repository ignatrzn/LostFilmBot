module.exports = {
  MAIN_MENU: {
    disable_notification: true,
    parse_mode: 'Markdown',
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: false,
      keyboard: [['📃 RSS 📃'], ['🔔 Получать ежедневно 🔔']],
    },
  },
  SUBSCRIPTION_MENU: {
    disable_notification: true,
    parse_mode: 'Markdown',
    reply_markup: {
      resize_keyboard: true,
      keyboard: [['📝 Подписаться 📝'], ['🔙 Назад 🔙']],
    },
  },
  TIME: {
    disable_notification: true,
    parse_mode: 'Markdown',
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          { text: '00:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '00:00' }) },
          { text: '01:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '01:00' }) },
          { text: '02:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '02:00' }) },
          { text: '03:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '03:00' }) },
        ],
        [
          { text: '04:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '04:00' }) },
          { text: '05:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '05:00' }) },
          { text: '06:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '06:00' }) },
          { text: '07:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '07:00' }) },
        ],
        [
          { text: '08:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '08:00' }) },
          { text: '09:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '09:00' }) },
          { text: '10:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '10:00' }) },
          { text: '11:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '11:00' }) },
        ],
        [
          { text: '12:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '12:00' }) },
          { text: '13:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '13:00' }) },
          { text: '14:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '14:00' }) },
          { text: '15:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '15:00' }) },
        ],
        [
          { text: '16:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '16:00' }) },
          { text: '17:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '17:00' }) },
          { text: '18:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '18:00' }) },
          { text: '19:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '19:00' }) },
        ],
        [
          { text: '20:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '20:00' }) },
          { text: '21:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '21:00' }) },
          { text: '22:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '22:00' }) },
          { text: '23:00', callback_data: JSON.stringify({ type: 'subscribe', payload: '23:00' }) },
        ],
      ],
    },
  },
}
